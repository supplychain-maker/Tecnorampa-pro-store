
'use server';
/**
 * @fileOverview Provides a general AI-powered logistics assistant for Tecnorampa.
 *
 * - aiLogisticsAssistantRecommendation - A function that suggests products based on a user's problem description.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AILogisticsAssistantRecommendationInputSchema = z.object({
  userQuery: z
    .string()
    .describe('The description of the problem or logistics need provided by the user.'),
});
export type AILogisticsAssistantRecommendationInput = z.infer<
  typeof AILogisticsAssistantRecommendationInputSchema
>;

const RecommendedProductSchema = z.object({
  name: z.string().describe('Name of the recommended Tecnorampa product.'),
  category: z.string().describe('Category of the product (e.g., Iluminación, Protección, Rampas, Estacionamiento).'),
  technicalJustification: z.string().describe('Specific technical reason why this product solves the user problem.')
});

const AILogisticsAssistantRecommendationOutputSchema = z.object({
  recommendations: z.array(RecommendedProductSchema).describe('List of products suggested for the user.'),
  explanation: z
    .string()
    .describe(
      'A global summary and expert advice justifying the solution proposed.'
    ),
});
export type AILogisticsAssistantRecommendationOutput = z.infer<
  typeof AILogisticsAssistantRecommendationOutputSchema
>;

export async function aiLogisticsAssistantRecommendation(
  input: AILogisticsAssistantRecommendationInput
): Promise<AILogisticsAssistantRecommendationOutput> {
  return aiLogisticsAssistantRecommendationFlow(input);
}

const assistantRecommendationPrompt = ai.definePrompt({
  name: 'assistantRecommendationPrompt',
  input: {schema: AILogisticsAssistantRecommendationInputSchema},
  output: {schema: AILogisticsAssistantRecommendationOutputSchema},
  prompt: `You are an expert industrial logistics and automotive solutions specialist for Tecnorampa. 
The user will describe a problem, a need, or a situation in their warehouse, loading bay, or parking facility. 
Your goal is to recommend the most suitable Tecnorampa products to solve their problem.

Current Catalog:
- Niveladora Hidráulica de andén: Automatic operation with a button. Best for efficiency and heavy loads (up to 50k lb). Smooth and safe.
- Niveladora Mecánica de andén: Manual operation with chains/springs. High resistance, 30k-40k lb capacity. Cost-effective and reliable.
- Mini Dock Hidráulico: Compact version of a dock leveler but hydraulic. Operated with one single button. 30k lb capacity. Easy to install at the edge of the dock. Best for quick upgrades with automatic operation.
- Mini Dock Mecánico: Compact and easy to install at the edge of the dock. 30k lb capacity. Lever operation, no electricity needed. Best for quick upgrades without major construction or electrical needs.
- Rampa de estacionamiento TR Evolution: Premium system for doubling parking space. High structural strength, allows full car door opening. Outdoor ready (IP protection). 7,000 lb capacity.
- Rampa de estacionamiento Parking Lift: Aesthetic and robust solution for condos or private parking. 6,000 lb capacity. Electro-hydraulic, works in exposed conditions.
- Lámpara de andén articulada: For low visibility inside trailers. Articulated 40" arm, LED.
- Semáforo para andén LED: For safety maneuvers, red/green signal control.
- Topes de andén reforzados: For heavy traffic, constant impacts from big trailers. Has a steel face plate.
- Topes de andén laminados: For standard industrial/commercial use, softer impact absorption, no steel plate.

USER PROBLEM:
"{{{userQuery}}}"

INSTRUCTIONS:
1. Analyze the user's query carefully.
2. If they mention needing more space for cars or doubling parking capacity:
   - Recommend "Rampa de estacionamiento TR Evolution" if they need maximum door clearance or premium features.
   - Recommend "Rampa de estacionamiento Parking Lift" if it's for a condo, private garage, or needs an aesthetic yet robust solution.
3. If they want automation or "just one button" on an existing dock, focus on "Mini Dock Hidráulico" or "Niveladora Hidráulica".
4. If they mention quick installation at the edge of the dock, choose between "Mini Dock Mecánico" (if no electricity) or "Mini Dock Hidráulico" (if they want a button).
5. If they mention gaps between truck and dock, loading heavy cargo, or needing a bridge/ramp, choose the most appropriate Ramp or Mini Dock.
6. If they mention crashes, impacts, or protection, focus on "Topes de andén".
7. If they mention night shifts, darkness, or accidents inside the truck, focus on "Lámparas de andén".
8. If they mention safety during docking, coordination with drivers, or red/green lights, focus on "Semáforos".
9. Provide a technical and professional justification for each.
10. Be conversational but highly technical.`,
});

const aiLogisticsAssistantRecommendationFlow = ai.defineFlow(
  {
    name: 'aiLogisticsAssistantRecommendationFlow',
    inputSchema: AILogisticsAssistantRecommendationInputSchema,
    outputSchema: AILogisticsAssistantRecommendationOutputSchema,
  },
  async (input) => {
    const {output} = await assistantRecommendationPrompt(input);
    return output!;
  }
);
