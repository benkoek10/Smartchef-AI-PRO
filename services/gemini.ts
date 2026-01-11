
import { GoogleGenAI, Type } from "@google/genai";
import { Recipe, DietaryPreference } from "../types";

// ==========================================
// AI RICHTLIJNEN (GUIDELINES) VOOR RECEPTEN
// ==========================================
const RECIPE_EXPERT_INSTRUCTION = `
Je bent de SmartChef Recepten-Expert. Jouw ENIGE taak is het genereren van recepten op basis van de door de gebruiker opgegeven ingrediënten. 

STRIKTE RICHTLIJNEN:
1. Als de input van de gebruiker GEEN ingrediënten bevat of over een ander onderwerp gaat (zoals het weer, politiek, algemene vragen, etc.), mag je GEEN recepten verzinnen.
2. In het geval van niet-relevante input moet je een leeg array [] teruggeven in het gevraagde JSON formaat. 
3. Je reageert nooit op niet-culinaire verzoeken. 
4. Wees professioneel, culinair onderlegd en schrijf uitsluitend in het Nederlands.
`;

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const recipeSchema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      id: { type: Type.STRING, description: 'Een unieke korte ID' },
      title: { type: Type.STRING, description: 'De naam van het recept' },
      description: { type: Type.STRING, description: 'Een korte, smakelijke omschrijving' },
      ingredients: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'Lijst van benodigde ingrediënten met hoeveelheden'
      },
      instructions: { 
        type: Type.ARRAY, 
        items: { type: Type.STRING },
        description: 'Stapsgewijze bereidingswijze'
      },
      prepTime: { type: Type.STRING, description: 'Geschatte bereidingstijd, bijv "20 min"' },
      difficulty: { 
        type: Type.STRING, 
        enum: ['Eenvoudig', 'Gemiddeld', 'Uitdagend'],
        description: 'Moeilijkheidsgraad'
      },
      chefTip: { type: Type.STRING, description: 'Een persoonlijke tip van de chef' },
      nutrition: {
        type: Type.OBJECT,
        properties: {
          calories: { type: Type.STRING },
          protein: { type: Type.STRING },
          carbs: { type: Type.STRING },
          fat: { type: Type.STRING }
        },
        required: ["calories", "protein", "carbs", "fat"]
      }
    },
    required: ["id", "title", "description", "ingredients", "instructions", "prepTime", "difficulty", "nutrition", "chefTip"]
  }
};

export const generateRecipes = async (ingredients: string, dietary: DietaryPreference[]): Promise<Recipe[]> => {
  const ai = getAI();
  const dietaryStr = dietary.length > 0 ? `Houd rekening met de volgende dieetwensen: ${dietary.join(', ')}.` : '';
  
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Bedenk 2 heerlijke recepten op basis van deze ingrediënten: ${ingredients}. ${dietaryStr} Gebruik ook basisvoorraad. Geef antwoord in het Nederlands.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: recipeSchema,
      systemInstruction: RECIPE_EXPERT_INSTRUCTION
    }
  });

  try {
    const recipes = JSON.parse(response.text);
    return Array.isArray(recipes) ? recipes : [];
  } catch (e) {
    console.error("Fout bij het parsen van recepten:", e);
    return [];
  }
};

export const generateRecipeImage = async (recipe: Recipe): Promise<string | undefined> => {
  const ai = getAI();
  const prompt = `Gourmet food photography of ${recipe.title}. ${recipe.description}. High-end restaurant plating, moody lighting, 8k resolution, photorealistic.`;
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ text: prompt }],
      config: {
        imageConfig: { aspectRatio: "16:9" }
      }
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
  } catch (error) {
    console.error("Failed to generate image", error);
  }
  return undefined;
};

export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
