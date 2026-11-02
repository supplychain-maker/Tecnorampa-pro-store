import os
from PIL import Image
from collections import deque

PRODUCTS_DIR = 'public/products'

def clean_image(filename):
    filepath = os.path.join(PRODUCTS_DIR, filename)
    try:
        orig = Image.open(filepath)
    except Exception as e:
        print(f"Skipping {filename}: {e}")
        return

    # Work in RGB
    is_png = filename.lower().endswith('.png')
    has_alpha = orig.mode == 'RGBA'
    
    img = orig.convert('RGBA' if has_alpha else 'RGB')
    w, h = img.size
    pixels = img.load()

    # Determine background seeds: sample all 4 perimeter borders
    visited = [[False]*h for _ in range(w)]
    queue = deque()

    # Seed with borders
    for x in range(w):
        queue.append((x, 0))
        queue.append((x, h - 1))
        visited[x][0] = True
        visited[x][h - 1] = True
    for y in range(h):
        if not visited[0][y]:
            queue.append((0, y))
            visited[0][y] = True
        if not visited[w - 1][y]:
            queue.append((w - 1, y))
            visited[w - 1][y] = True

    # Flood fill: any pixel that connects to the border and is near-white or neutral light gray
    # luminance >= 200, low saturation (max-min <= 18)
    while queue:
        cx, cy = queue.popleft()
        for nx, ny in [(cx+1, cy), (cx-1, cy), (cx, cy+1), (cx, cy-1)]:
            if 0 <= nx < w and 0 <= ny < h and not visited[nx][ny]:
                px = pixels[nx, ny]
                if has_alpha:
                    r, g, b, a = px
                    if a < 30: # transparent is background
                        visited[nx][ny] = True
                        queue.append((nx, ny))
                        continue
                else:
                    r, g, b = px[:3]
                
                # Check if near-white/light gray
                min_c = min(r, g, b)
                max_c = max(r, g, b)
                diff = max_c - min_c
                
                # Background criteria:
                # 1. Pure white
                # 2. Or very light (>= 245)
                # 3. Or neutral light gray (>= 195 with diff <= 12)
                # 4. Or for specific images like parking lift, studio gray (239) or floor (214)
                is_bg = (
                    (r == 255 and g == 255 and b == 255) or
                    (min_c >= 240 and diff <= 15) or
                    (min_c >= 195 and diff <= 10)
                )
                
                if is_bg:
                    visited[nx][ny] = True
                    queue.append((nx, ny))

    # Apply changes
    replaced = 0
    for x in range(w):
        for y in range(h):
            px = pixels[x, y]
            r, g, b = px[:3]
            
            # Additional clamp for parking lift studio gray (239) and floor (214)
            is_studio_gray = (abs(r - 239) <= 6 and abs(g - 239) <= 6 and abs(b - 239) <= 6)
            is_floor = (abs(r - 214) <= 8 and abs(g - 214) <= 8 and abs(b - 214) <= 8 and (x < 280 or x > 660 or y > 320))
            is_near_pure_white = (min(r, g, b) >= 248 and (max(r, g, b) - min(r, g, b)) <= 5)
            
            if visited[x][y] or is_studio_gray or is_floor or is_near_pure_white:
                if (r, g, b) != (255, 255, 255):
                    if has_alpha:
                        pixels[x, y] = (255, 255, 255, 255)
                    else:
                        pixels[x, y] = (255, 255, 255)
                    replaced += 1

    if replaced > 0:
        # Save back
        if is_png:
            img.save(filepath, format='PNG', optimize=True)
        else:
            # Convert to RGB if saving JPEG
            rgb_img = img.convert('RGB')
            rgb_img.save(filepath, format='JPEG', quality=95)
        print(f"Cleaned {filename:38} | Replaced {replaced} pixels ({replaced/(w*h)*100:.1f}%)")
    else:
        print(f"Skipped {filename:38} | Already pure white background")

if __name__ == '__main__':
    all_files = sorted(os.listdir(PRODUCTS_DIR))
    for f in all_files:
        if f.lower().endswith(('.jpg', '.jpeg', '.png', '.webp')):
            clean_image(f)
