
import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PetAction, GestureResponse } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const RESPONSE_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    action: {
      type: Type.STRING,
      enum: [
        PetAction.IDLE,
        PetAction.WALK,
        PetAction.JUMP,
        PetAction.SIT,
        PetAction.ROLL,
        PetAction.PAT,
        PetAction.STRIKE,
        PetAction.CALL
      ],
      description: "The detected gesture mapped to a pet action.",
    },
    reasoning: {
      type: Type.STRING,
      description: "Short explanation of what gesture was seen.",
    },
    mood: {
      type: Type.STRING,
      description: "A cute anime-style mood word (e.g., Happy, Scared, Curious).",
    },
    navigation: {
      type: Type.OBJECT,
      properties: {
        x: { type: Type.NUMBER, description: "X direction (-1 left to 1 right)" },
        z: { type: Type.NUMBER, description: "Z direction (-1 back to 1 forward)" }
      },
      required: ["x", "z"],
      description: "Movement vector if walking, otherwise 0,0"
    }
  },
  required: ["action", "reasoning", "mood", "navigation"],
};

export const analyzeGesture = async (base64Image: string): Promise<GestureResponse> => {
  try {
    // Remove header if present
    const cleanBase64 = base64Image.replace(/^data:image\/(png|jpeg|webp);base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: "image/jpeg",
              data: cleanBase64,
            },
          },
          {
            text: `Analyze the user's hand gesture or face to control a virtual cat.
            
            Map the visual input to an action:
            - WALK: Hand making an upside-down 'V' shape (fingers as legs). Estimate direction (x,z).
            - CALL: User puckering lips (whistling face), pointing to self, or beckoning gesture. Mood: Excited.
            - JUMP: Upward hand movement, thumbs up, or lifting hand high.
            - SIT: Palm facing down or pointing down.
            - ROLL: Circular hand motion or rolling index fingers.
            - PAT: Hand reaching towards camera/screen (petting motion).
            - STRIKE: Aggressive punch, chop, or angry face.
            - IDLE: No clear gesture.

            Return JSON with action, mood, reasoning, and navigation vector.`
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: RESPONSE_SCHEMA,
        systemInstruction: "You are the brain of a virtual anime cat. Interpret visual commands instantly.",
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response from Gemini");
    
    return JSON.parse(text) as GestureResponse;
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      action: PetAction.IDLE,
      reasoning: "Error analyzing gesture",
      mood: "Confused",
      navigation: { x: 0, z: 0 }
    };
  }
};
