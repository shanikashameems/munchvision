import { NextRequest, NextResponse } from "next/server";
import { ai } from "@/src/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const { image } = await req.json();

    if (!image) {
      return NextResponse.json({ error: "No food image payload provided." }, { status: 400 });
    }

    // Clean out base64 structural metadata header strings if present
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          inlineData: {
            mimeType: "image/jpeg",
            data: base64Data,
          },
        },
        `You are MunchVision, an expert visual culinary nutritionist. 
        Analyze this food image completely. Break the contents of the plate into distinct, recognizable items. 
        Estimate individual item portions in grams based on structural visual cues, then compute precise macro profiles.
        
        Provide a chill, high-end, friendly health insight (1-2 sentences) assessing the meal balance.
        
        You must strictly output the analytical data using this exact JSON layout schema:
        {
          "totalCalories": number,
          "totalProtein": number,
          "totalCarbs": number,
          "totalFat": number,
          "itemsDetected": [
            {
              "name": "string (e.g., Grilled Chicken Breast)",
              "estimatedWeightGrams": number,
              "calories": number,
              "proteinGrams": number,
              "carbsGrams": number,
              "fatGrams": number
            }
          ],
          "allergens": ["string"],
          "dietaryFlags": ["string (e.g., High-Protein, Low-Carb, Vegan, Gluten-Free)"],
          "healthInsight": "string"
        }`,
      ],
      // Enforces a strict JSON parsing standard on the model execution layer
      config: {
        responseMimeType: "application/json",
      },
    });

    const responseText = response.text;
    
    if (!responseText) {
      throw new Error("Empty response received from the vision platform.");
    }

    const payload = JSON.parse(responseText);
    return NextResponse.json(payload);

  } catch (error: any) {
    console.error("MunchVision Scanner Error:", error);
    return NextResponse.json(
      { error: "Failed to decode the food image. Let's try another angle." },
      { status: 500 }
    );
  }
}