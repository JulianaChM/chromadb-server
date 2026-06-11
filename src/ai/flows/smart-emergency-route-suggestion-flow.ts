'use server';
/**
 * @fileOverview A Genkit flow for suggesting the most appropriate hospital and available ambulance for a new emergency.
 *
 * - smartEmergencyRouteSuggestion - A function that handles the intelligent emergency route suggestion process.
 * - SmartEmergencyRouteSuggestionInput - The input type for the smartEmergencyRouteSuggestion function.
 * - SmartEmergencyRouteSuggestionOutput - The return type for the smartEmergencyRouteSuggestion function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const CoordinatesSchema = z.object({
  latitude: z.number().describe('The latitude coordinate.'),
  longitude: z.number().describe('The longitude coordinate.'),
});

const AmbulanceSchema = z.object({
  id: z.string().describe('Unique identifier for the ambulance.'),
  code: z.string().describe('Identifier code for the ambulance.'),
  status: z
    .enum(['available', 'en route', 'occupied', 'out of service'])
    .describe('Current operational status of the ambulance.'),
  currentLocation: z
    .string()
    .describe('Current physical address of the ambulance.'),
  coordinates: CoordinatesSchema.describe('Geographical coordinates of the ambulance.'),
});

const HospitalSchema = z.object({
  id: z.string().describe('Unique identifier for the hospital.'),
  name: z.string().describe('Name of the hospital.'),
  address: z.string().describe('Physical address of the hospital.'),
  coordinates: CoordinatesSchema.describe('Geographical coordinates of the hospital.'),
  capacity: z
    .number()
    .describe('Total patient capacity of the hospital (e.g., number of beds).'),
  occupancyCurrent: z
    .number()
    .describe('Current number of occupied beds/patients in the hospital.'),
  specialties: z
    .array(z.string())
    .describe('List of medical specialties available at the hospital.'),
});

const SmartEmergencyRouteSuggestionInputSchema = z.object({
  patientCondition: z
    .string()
    .describe(
      'A description of the patient\'s medical condition (e.g., "cardiac arrest", "broken leg").'
    ),
  patientLocation: z
    .string()
    .describe('The physical address of the patient\'s emergency location.'),
  patientCoordinates: CoordinatesSchema.describe(
    'Geographical coordinates of the patient\'s emergency location.'
  ),
  availableAmbulances: z
    .array(AmbulanceSchema)
    .describe('A list of all currently available ambulances, their status, and locations.'),
  availableHospitals: z
    .array(HospitalSchema)
    .describe('A list of all nearby hospitals, their capacity, occupancy, and specialties.'),
});
export type SmartEmergencyRouteSuggestionInput = z.infer<
  typeof SmartEmergencyRouteSuggestionInputSchema
>;

const SmartEmergencyRouteSuggestionOutputSchema = z.object({
  suggestedHospitalId: z
    .string()
    .describe('The ID of the most appropriate hospital suggested by the AI.'),
  suggestedAmbulanceId: z
    .string()
    .describe('The ID of the most appropriate ambulance suggested by the AI.'),
  estimatedTravelTimeMinutes: z
    .number()
    .describe(
      'Estimated total travel time from the suggested ambulance to the patient, then to the suggested hospital, in minutes.'
    ),
  estimatedDistanceKm: z
    .number()
    .describe(
      'Estimated total travel distance from the suggested ambulance to the patient, then to the suggested hospital, in kilometers.'
    ),
  reasoning: z
    .string()
    .describe('A detailed explanation for the AI\'s suggestion of the hospital and ambulance.'),
});
export type SmartEmergencyRouteSuggestionOutput = z.infer<
  typeof SmartEmergencyRouteSuggestionOutputSchema
>;

export async function smartEmergencyRouteSuggestion(
  input: SmartEmergencyRouteSuggestionInput
): Promise<SmartEmergencyRouteSuggestionOutput> {
  return smartEmergencyRouteSuggestionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'smartEmergencyRouteSuggestionPrompt',
  input: { schema: SmartEmergencyRouteSuggestionInputSchema },
  output: { schema: SmartEmergencyRouteSuggestionOutputSchema },
  prompt: `You are an expert emergency dispatcher for "CodeBlueAI". Your primary goal is to quickly and efficiently assign the most appropriate ambulance and hospital for a new emergency, minimizing response times and ensuring the patient receives the best possible care.

A new emergency has been reported with the following details:
Patient Condition: {{{patientCondition}}}
Patient Location: {{{patientLocation}}} (Coordinates: Latitude {{patientCoordinates.latitude}}, Longitude {{patientCoordinates.longitude}})

Here are the available ambulances:
{{#each availableAmbulances}}
- ID: {{id}}, Code: {{code}}, Status: {{status}}, Current Location: {{currentLocation}} (Coordinates: Latitude {{coordinates.latitude}}, Longitude {{coordinates.longitude}})
{{/each}}

Here are the available hospitals:
{{#each availableHospitals}}
- ID: {{id}}, Name: {{name}}, Address: {{address}} (Coordinates: Latitude {{coordinates.latitude}}, Longitude {{coordinates.longitude}}), Capacity: {{capacity}}, Current Occupancy: {{occupancyCurrent}}, Specialties: {{#each specialties}}{{{this}}}{{#unless @last}}, {{/unless}}{{/each}}
{{/each}}

Considering the patient's condition, location, and the availability, status, location, capacity, and specialties of all ambulances and hospitals, suggest the single best ambulance and the single best hospital. Provide an estimation for the total travel time and distance for the ambulance to pick up the patient and then transport them to the suggested hospital. Explain your reasoning for the choices.

Ensure the output strictly adheres to the provided JSON schema.`,
});

const smartEmergencyRouteSuggestionFlow = ai.defineFlow(
  {
    name: 'smartEmergencyRouteSuggestionFlow',
    inputSchema: SmartEmergencyRouteSuggestionInputSchema,
    outputSchema: SmartEmergencyRouteSuggestionOutputSchema,
  },
  async (input) => {
    const { output } = await prompt(input);
    return output!;
  }
);
