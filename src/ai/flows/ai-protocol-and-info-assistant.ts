'use server';
/**
 * @fileOverview An AI chatbot assistant for emergency operators and medical staff.
 *
 * - aiProtocolAndInfoAssistant - A function that handles user queries for medical protocols, route explanations, and hospital availability.
 * - AIProtocolAndInfoAssistantInput - The input type for the aiProtocolAndInfoAssistant function.
 * - AIProtocolAndInfoAssistantOutput - The return type for the aiProtocolAndInfoAssistant function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const AIProtocolAndInfoAssistantInputSchema = z.object({
  query: z.string().describe('The user\'s question or request to the AI assistant.'),
});
export type AIProtocolAndInfoAssistantInput = z.infer<typeof AIProtocolAndInfoAssistantInputSchema>;

const AIProtocolAndInfoAssistantOutputSchema = z.object({
  response: z.string().describe('The AI assistant\'s response to the user\'s query.'),
});
export type AIProtocolAndInfoAssistantOutput = z.infer<typeof AIProtocolAndInfoAssistantOutputSchema>;

/**
 * Mocks a call to retrieve detailed medical protocol information.
 * In a real application, this would interact with a database or external service.
 */
const getMedicalProtocol = ai.defineTool(
  {
    name: 'getMedicalProtocol',
    description: 'Provides detailed information on specific medical emergency protocols. Use this tool when the user asks about medical procedures, guidelines, or steps for a particular medical condition or emergency.',
    inputSchema: z.object({
      protocolName: z
        .string()
        .describe(
          'The specific name or topic of the medical protocol the user is asking about (e.g., "cardiac arrest protocol", "stroke management guidelines").'
        ),
    }),
    outputSchema: z.string().describe('Detailed information about the requested medical protocol.'),
  },
  async (input) => {
    const protocols: { [key: string]: string } = {
      'cardiac arrest':
        'Adult Cardiac Arrest Protocol: 1. Confirm unresponsiveness and absence of breathing/pulse. 2. Activate EMS and call for defibrillator. 3. Initiate high-quality chest compressions (100-120/min, 5-6cm deep). 4. Administer 2 rescue breaths after 30 compressions. 5. Apply AED/defibrillator as soon as available and follow prompts. 6. Administer Epinephrine 1mg IV/IO every 3-5 minutes. 7. Consider Amioarone for refractory VF/pVT. Continue until ROSC or termination criteria met.',
      stroke:
        'Acute Stroke Protocol: 1. Time is brain! Rapid recognition of stroke symptoms (FAST: Face drooping, Arm weakness, Speech difficulty, Time to call emergency). 2. Immediate transport to a stroke-capable facility. 3. Perform rapid neurological assessment (NIHSS). 4. STAT head CT scan to rule out hemorrhage. 5. Consider IV thrombolysis (tPA) within 4.5 hours of symptom onset for ischemic stroke. 6. Consider mechanical thrombectomy for large vessel occlusion. 7. Continuous monitoring and supportive care.',
      'anaphylactic shock':
        'Anaphylactic Shock Protocol: 1. Remove allergen if possible. 2. Call for immediate medical assistance/911. 3. Administer Epinephrine intramuscularly (adult: 0.3-0.5mg, child: 0.01mg/kg up to 0.3mg) repeat every 5-15 minutes as needed. 4. Position patient supine with legs elevated (unless breathing difficulty). 5. Administer oxygen. 6. Start IV fluids. 7. Consider H1 and H2 blockers, corticosteroids. Monitor closely for rebound anaphylaxis.',
    };
    const protocol = protocols[input.protocolName.toLowerCase()];
    return protocol
      ? `Here is the protocol for ${input.protocolName}: ${protocol}`
      : `I could not find a specific protocol for '${input.protocolName}'. Please check the name or ask about a different protocol.`;
  }
);

/**
 * Mocks a call to explain route and hospital assignment decisions.
 * In a real application, this would query a routing and assignment optimization engine.
 */
const explainRouteAndAssignment = ai.defineTool(
  {
    name: 'explainRouteAndAssignment',
    description: 'Explains the reasoning behind a suggested emergency route or a specific hospital assignment. Use this tool when the user asks why a certain route was chosen or why a patient was assigned to a particular hospital.',
    inputSchema: z.object({
      emergencyIdentifier: z
        .string()
        .describe(
          'An identifier for the emergency, route, or hospital assignment to be explained. This could be an emergency ID, route ID, or hospital name.'
        ),
    }),
    outputSchema: z.string().describe('A clear explanation of the route or hospital assignment, including factors considered like traffic, hospital capacity, and patient needs.'),
  },
  async (input) => {
    const explanations: { [key: string]: string } = {
      'E-001':
        'Route E-001 to General Hospital was chosen due to minimal traffic on main arteries and General Hospital\'s current availability of 3 trauma bays, which are critical for the patient\'s reported injuries. Estimated travel time is 12 minutes.',
      'H-Mercy':
        'Patient assigned to Mercy Hospital because it\'s the closest facility with an open pediatric ICU bed, which is a critical requirement based on the patient\'s age and condition. The route avoids current construction delays.',
      'R-20230315-A':
        'Route R-20230315-A was optimized based on real-time traffic data, avoiding a major accident on the usual direct path. This saved an estimated 7 minutes in travel time to University Hospital, which has adequate capacity.',
    };
    const explanation = explanations[input.emergencyIdentifier];
    return explanation
      ? `Explanation for ${input.emergencyIdentifier}: ${explanation}`
      : `No detailed explanation found for identifier '${input.emergencyIdentifier}'. Please ensure the identifier is correct.`;
  }
);

/**
 * Mocks a call to retrieve real-time hospital availability.
 * In a real application, this would query a hospital management system.
 */
const getHospitalAvailability = ai.defineTool(
  {
    name: 'getHospitalAvailability',
    description: 'Retrieves real-time availability information for hospitals, including bed capacity, specialized unit availability (e.g., ICU, trauma), or overall status. Use this tool when the user asks about a hospital\'s current status or capacity for specific care.',
    inputSchema: z.object({
      hospitalName: z
        .string()
        .optional()
        .describe(
          'The name of the hospital to check availability for. If not provided, general availability for all nearby hospitals might be returned.'
        ),
      specialty: z
        .string()
        .optional()
        .describe('The specific medical specialty or unit (e.g., "ICU", "pediatrics", "trauma bay") to check availability for.'),
    }),
    outputSchema: z
      .string()
      .describe('Current availability status of the requested hospital(s), including capacity for specific specialties if queried.'),
  },
  async (input) => {
    const hospitalData: { [key: string]: { [key: string]: string } } = {
      'General Hospital': {
        general: '50% capacity, 10 general beds, 3 trauma bays open.',
        icu: '2 ICU beds available.',
        trauma: '3 trauma bays open.',
        pediatrics: 'No pediatric ICU, 5 general pediatric beds available.',
      },
      'Mercy Hospital': {
        general: '75% capacity, 5 general beds, 1 trauma bay open.',
        icu: '0 ICU beds available, 1 on standby.',
        pediatrics: '2 pediatric ICU beds available, 3 general pediatric beds.',
      },
      'University Hospital': {
        general: '30% capacity, 20 general beds, 5 trauma bays open.',
        icu: '5 ICU beds available.',
        cardiology: 'Fully staffed, 2 cardiac cath labs available.',
      },
    };

    if (input.hospitalName) {
      const hospital = hospitalData[input.hospitalName];
      if (hospital) {
        if (input.specialty) {
          const specialtyAvailability = hospital[input.specialty.toLowerCase()];
          return specialtyAvailability
            ? `At ${input.hospitalName}, ${input.specialty}: ${specialtyAvailability}`
            : `No specific availability data for ${input.specialty} at ${input.hospitalName}. General: ${hospital.general}`;
        } else {
          return `Current availability for ${input.hospitalName}: ${hospital.general}`;
        }
      } else {
        return `Hospital '${input.hospitalName}' not found in the system.`;
      }
    } else {
      // General availability for all hospitals
      return `General Hospital: ${hospitalData['General Hospital'].general}; Mercy Hospital: ${hospitalData['Mercy Hospital'].general}; University Hospital: ${hospitalData['University Hospital'].general}`;
    }
  }
);

const aiProtocolAndInfoAssistantPrompt = ai.definePrompt({
  name: 'aiProtocolAndInfoAssistantPrompt',
  input: { schema: AIProtocolAndInfoAssistantInputSchema },
  output: { schema: AIProtocolAndInfoAssistantOutputSchema },
  tools: [getMedicalProtocol, explainRouteAndAssignment, getHospitalAvailability],
  system:
    "You are CodeBlueAI, an intelligent assistant for hospital emergency route planning. Your goal is to provide quick and accurate information to emergency operators and medical staff. Your responses should be professional, concise, and helpful.\n\nUse the provided tools to answer questions regarding medical protocols, explain route and hospital assignments, and check hospital availability.\n\nIf a question can be answered by using one of your tools, prioritize using the tool. If the user asks for general operational recommendations or other general information, try to answer directly. If a tool needs a specific identifier (like an emergency ID or hospital name) but it's not provided by the user, ask for clarification.",
  prompt: '{{{query}}}',
});

const aiProtocolAndInfoAssistantFlow = ai.defineFlow(
  {
    name: 'aiProtocolAndInfoAssistantFlow',
    inputSchema: AIProtocolAndInfoAssistantInputSchema,
    outputSchema: AIProtocolAndInfoAssistantOutputSchema,
  },
  async (input) => {
    const { output } = await aiProtocolAndInfoAssistantPrompt(input);
    return output!;
  }
);

export async function aiProtocolAndInfoAssistant(input: AIProtocolAndInfoAssistantInput): Promise<AIProtocolAndInfoAssistantOutput> {
  return aiProtocolAndInfoAssistantFlow(input);
}
