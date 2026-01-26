// Gemini API client for food label analysis
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY || '');

export interface FoodAnalysisResult {
    productName: string;
    fructoseLevel: 'high' | 'moderate' | 'low' | 'none';
    fructoseAmount: string;
    sorbitolLevel: 'high' | 'moderate' | 'low' | 'none';
    sorbitolAmount: string;
    ingredients: Array<{
        name: string;
        risk: 'high' | 'moderate' | 'safe';
    }>;
    safeAlternative: string;
    warnings: string[];
    overallRisk: 'high' | 'moderate' | 'low' | 'safe';
}

export async function analyzeLabel(imageBase64: string): Promise<FoodAnalysisResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

    const prompt = `You are an expert nutritionist specialized in fructose and sorbitol intolerance.
Analyze this food label image and provide a detailed assessment for someone with fructose and sorbitol sensitivity.

Respond ONLY with a valid JSON object in the following format:
{
  "productName": "Name of the product",
  "fructoseLevel": "high" | "moderate" | "low" | "none",
  "fructoseAmount": "Xg per 100ml/g" (estimate if not clearly stated),
  "sorbitolLevel": "high" | "moderate" | "low" | "none",
  "sorbitolAmount": "Xg per 100ml/g" (estimate if not clearly stated),
  "ingredients": [
    { "name": "ingredient name", "risk": "high" | "moderate" | "safe" }
  ],
  "safeAlternative": "Suggest a safe alternative product",
  "warnings": ["List any specific warnings for this product"],
  "overallRisk": "high" | "moderate" | "low" | "safe"
}

Rules for classification:
- HIGH fructose: >10g per 100g or contains high-fructose corn syrup, concentrated fruit juice
- MODERATE fructose: 5-10g per 100g or contains honey, maple syrup
- LOW fructose: 1-5g per 100g
- NONE: <1g per 100g

- Look for sorbitol (E420), maltitol (E965), xylitol, mannitol in ingredients
- Fruits like apples, pears, mangoes are high in fructose
- Stone fruits contain sorbitol naturally

Always provide helpful, actionable information.`;

    try {
        const result = await model.generateContent([
            { text: prompt },
            {
                inlineData: {
                    mimeType: 'image/jpeg',
                    data: imageBase64,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();

        // Extract JSON from the response
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        const parsed = JSON.parse(jsonMatch[0]) as FoodAnalysisResult;
        return parsed;
    } catch (error) {
        console.error('Error analyzing label:', error);
        // Return a fallback result
        return {
            productName: 'Unknown Product',
            fructoseLevel: 'moderate',
            fructoseAmount: 'Unable to determine',
            sorbitolLevel: 'low',
            sorbitolAmount: 'Unable to determine',
            ingredients: [],
            safeAlternative: 'Please try scanning a clearer image',
            warnings: ['Could not analyze the image properly. Please try again with a clearer photo.'],
            overallRisk: 'moderate',
        };
    }
}

export async function analyzeText(foodDescription: string): Promise<FoodAnalysisResult> {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.0-pro' });

    const prompt = `You are an expert nutritionist specialized in fructose and sorbitol intolerance.
Analyze this food/product: "${foodDescription}"

Provide a detailed assessment for someone with fructose and sorbitol sensitivity.

Respond ONLY with a valid JSON object in the following format:
{
  "productName": "${foodDescription}",
  "fructoseLevel": "high" | "moderate" | "low" | "none",
  "fructoseAmount": "Xg per 100g (estimated)",
  "sorbitolLevel": "high" | "moderate" | "low" | "none",
  "sorbitolAmount": "Xg per 100g (estimated)",
  "ingredients": [
    { "name": "ingredient/component", "risk": "high" | "moderate" | "safe" }
  ],
  "safeAlternative": "Suggest a safe alternative",
  "warnings": ["List any specific warnings"],
  "overallRisk": "high" | "moderate" | "low" | "safe"
}`;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
            throw new Error('No JSON found in response');
        }

        return JSON.parse(jsonMatch[0]) as FoodAnalysisResult;
    } catch (error) {
        console.error('Error analyzing text:', error);
        return {
            productName: foodDescription,
            fructoseLevel: 'moderate',
            fructoseAmount: 'Unable to determine',
            sorbitolLevel: 'low',
            sorbitolAmount: 'Unable to determine',
            ingredients: [],
            safeAlternative: 'Unable to suggest an alternative',
            warnings: ['Could not analyze the food properly. Please try again.'],
            overallRisk: 'moderate',
        };
    }
}
