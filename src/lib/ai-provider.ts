// Unified AI Provider Wrapper

import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';

export type AIProviderType = 'google' | 'openai' | 'anthropic' | 'perplexity';

const GOOGLE_API_KEY = process.env.GOOGLE_AI_API_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const PERPLEXITY_API_KEY = process.env.PERPLEXITY_API_KEY || '';
const SELECTED_PROVIDER = (process.env.AI_PROVIDER || 'google') as AIProviderType;

const languageMapper: Record<string, string> = {
    'ca': 'Catalan',
    'es': 'Spanish',
    'en': 'English'
};

// Initialize clients
const googleAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const openai = new OpenAI({ apiKey: OPENAI_API_KEY, dangerouslyAllowBrowser: true });
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
const perplexity = new OpenAI({
    apiKey: PERPLEXITY_API_KEY,
    baseURL: 'https://api.perplexity.ai',
    dangerouslyAllowBrowser: true
});

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

export interface MenuPlan {
    title: string;
    days: Array<{
        day: string;
        meals: {
            breakfast: Meal;
            lunch: Meal;
            snack: Meal;
            dinner: Meal;
        };
    }>;
    notes: string[];
}

interface Meal {
    name: string;
    description: string;
    ingredients: string[];
    safe: boolean;
}

export async function unifiedAnalyze(input: { image?: string; text?: string }, lang: string = 'en'): Promise<FoodAnalysisResult> {
    const provider = getProvider();

    // Use Perplexity if selected or if OpenAI is missing but Perplexity key exists (for images too)
    if (input.image) {
        if (provider === 'perplexity') {
            return analyzeWithPerplexity(input, lang);
        }
        // Fallback for image: Try OpenAI, then Perplexity, then Anthropic
        if (OPENAI_API_KEY) return analyzeWithOpenAI(input, lang);
        if (PERPLEXITY_API_KEY) return analyzeWithPerplexity(input, lang);
        if (ANTHROPIC_API_KEY) return analyzeWithAnthropic(input, lang);
    }

    if (provider === 'openai') {
        return analyzeWithOpenAI(input, lang);
    } else if (provider === 'anthropic') {
        return analyzeWithAnthropic(input, lang);
    } else if (provider === 'perplexity') {
        return analyzeWithPerplexity(input, lang);
    } else {
        return analyzeWithGoogle(input, lang);
    }
}

export async function unifiedGenerateMenu(userRequest: string, lang: string = 'en'): Promise<MenuPlan> {
    const preferredProvider = getProvider();
    const providers: AIProviderType[] = [preferredProvider, 'google', 'openai', 'perplexity', 'anthropic'];
    // Remove duplicates
    const pList = [...new Set(providers)];

    for (const p of pList) {
        // Skip fallback if no key is present for that provider (getProvider checks this, but we double check for fallback list)
        if (p === 'google' && !GOOGLE_API_KEY) continue;
        if (p === 'openai' && !OPENAI_API_KEY) continue;
        if (p === 'anthropic' && !ANTHROPIC_API_KEY) continue;
        if (p === 'perplexity' && !PERPLEXITY_API_KEY) continue;

        try {
            console.log(`Generating menu with ${p}...`);
            if (p === 'openai') {
                return await generateMenuWithOpenAI(userRequest, lang);
            } else if (p === 'anthropic') {
                return await generateMenuWithAnthropic(userRequest, lang);
            } else if (p === 'perplexity') {
                return await generateMenuWithPerplexity(userRequest, lang);
            } else {
                return await generateMenuWithGoogle(userRequest, lang);
            }
        } catch (error) {
            console.error(`Provider ${p} failed for menu generation:`, error);
            // Continue to next provider
        }
    }

    console.error('All providers failed for menu generation, returning mock menu.');
    return getMockMenu(userRequest, lang);
}

function getMockMenu(userRequest: string, lang: string = 'en'): MenuPlan {
    const isCa = lang === 'ca';
    // Helper for translation - Generic to handle strings and arrays
    const t = <T>(es: T, ca: T, en: T): T => isCa ? ca : (lang === 'es' ? es : en);

    return {
        title: t(`Menú Seguro - ${userRequest}`, `Menú Segur - ${userRequest}`, `Safe Menu - ${userRequest}`),
        days: [
            {
                day: t("Día 1", "Dia 1", "Day 1"),
                meals: {
                    breakfast: {
                        name: t("Quinoa Porridge con Arándanos", "Farinetes de Quinoa amb Nabius", "Quinoa Porridge with Blueberries"),
                        description: t("Quinoa cocida con leche sin lactosa, arándanos frescos y canela", "Quinoa cuita amb llet sense lactosa, nabius frescos i canyella", "Cooked quinoa with lactose-free milk, fresh blueberries, and cinnamon"),
                        ingredients: t(["Quinoa", "Leche sin lactosa", "Arándanos", "Canela"], ["Quinoa", "Llet sense lactosa", "Nabius", "Canyella"], ["Quinoa", "Lactose-free milk", "Blueberries", "Cinnamon"]) as any,
                        safe: true
                    },
                    lunch: {
                        name: t("Pollo a la Plancha con Arroz", "Pollastre a la Planxa amb Arròs", "Grilled Chicken with Rice"),
                        description: t("Pechuga de pollo con arroz basmati y verduras al vapor", "Pit de pollastre amb arròs basmati i verdures al vapor", "Chicken breast with basmati rice and steamed vegetables"),
                        ingredients: t(["Pollo", "Arroz basmati", "Zanahorias", "Judías verdes"], ["Pollastre", "Arròs basmati", "Pastanagues", "Mongetes verdes"], ["Chicken", "Basmati rice", "Carrots", "Green beans"]) as any,
                        safe: true
                    },
                    snack: {
                        name: t("Yogur Natural con Nueces", "Iogurt Natural amb Nous", "Natural Yogurt with Walnuts"),
                        description: t("Yogur sin azúcar con nueces picadas", "Iogurt sense sucre amb nous picades", "Sugar-free yogurt with chopped walnuts"),
                        ingredients: t(["Yogur natural", "Nueces"], ["Iogurt natural", "Nous"], ["Natural yogurt", "Walnuts"]) as any,
                        safe: true
                    },
                    dinner: {
                        name: t("Salmón al Horno con Patatas", "Salmó al Forn amb Patates", "Baked Salmon with Potatoes"),
                        description: t("Filete de salmón con patatas asadas y espinacas", "Filet de salmó amb patates al forn i espinacs", "Salmon fillet with baked potatoes and spinach"),
                        ingredients: t(["Salmón", "Patatas", "Espinacas", "Aceite de oliva"], ["Salmó", "Patates", "Espinacs", "Oli d'oliva"], ["Salmon", "Potatoes", "Spinach", "Olive oil"]) as any,
                        safe: true
                    }
                }
            }
        ],
        notes: [
            t(
                "⚠️ NOTA: Este es un menú de ejemplo. La generación con IA puede estar experimentando problemas.",
                "⚠️ NOTA: Aquest és un menú d'exemple. La generació amb IA pot estar experimentant problemes.",
                "⚠️ NOTE: This is a sample menu. AI generation may be experiencing issues."
            ),
            t(
                "Para activar la generación personalizada con IA, verifica que tus API keys tengan acceso a los modelos seleccionados.",
                "Per activar la generació personalitzada amb IA, verifica que les teves claus API tinguin accés als models seleccionats.",
                "To enable custom AI generation, verify that your API keys have access to the selected models."
            ),
            t(
                "Todos los alimentos sugeridos son seguros para intolerancia a fructosa y sorbitol.",
                "Tots els aliments suggerits són segurs per a la intolerància a la fructosa i el sorbitol.",
                "All suggested foods are safe for fructose and sorbitol intolerance."
            )
        ]
    };
}

function getProvider(): AIProviderType {
    // Check if keys exist for the selected provider, fallback to one that has keys
    if (SELECTED_PROVIDER === 'perplexity' && PERPLEXITY_API_KEY) return 'perplexity';
    if (SELECTED_PROVIDER === 'openai' && OPENAI_API_KEY) return 'openai';
    if (SELECTED_PROVIDER === 'anthropic' && ANTHROPIC_API_KEY) return 'anthropic';
    if (GOOGLE_API_KEY) return 'google';

    // Last resort fallback
    if (PERPLEXITY_API_KEY) return 'perplexity';
    if (OPENAI_API_KEY) return 'openai';
    if (ANTHROPIC_API_KEY) return 'anthropic';
    return 'google';
}

// --- GOOGLE (GEMINI) ---
async function analyzeWithGoogle(input: { image?: string; text?: string }, lang: string): Promise<FoodAnalysisResult> {
    const model = googleAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
    const targetLang = languageMapper[lang] || 'English';

    const prompt = `Analyze this food ${input.image ? 'image' : 'description'}: "${input.text || 'food item in the image'}"
  CRITICAL: Respond ONLY in ${targetLang}. All values in the JSON must be in ${targetLang}.
  Analyze the food for FRUCTOSE and SORBITOL content. This is for people with fructose/sorbitol intolerance.
  Respond ONLY with a valid JSON:
  {
    "productName": "string",
    "fructoseLevel": "high"|"moderate"|"low"|"none",
    "fructoseAmount": "string",
    "sorbitolLevel": "high"|"moderate"|"low"|"none",
    "sorbitolAmount": "string",
    "ingredients": [{"name": "string", "risk": "high"|"moderate"|"safe"}],
    "safeAlternative": "string",
    "warnings": ["string"],
    "overallRisk": "high"|"moderate"|"low"|"safe"
  }`;

    try {
        let result;
        if (input.image) {
            console.log('Attempting image analysis with Gemini Flash...');
            console.log('Image data length:', input.image.length);
            result = await model.generateContent([
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: input.image } }
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const text = result.response.text();
        console.log('Gemini response received, length:', text.length);
        return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch (e: any) {
        console.error('Google analysis error:', e?.message || e);

        // If image analysis fails, try without the image using text description
        if (input.image) {
            console.log('Image analysis failed, attempting text-only fallback...');
            try {
                const fallbackPrompt = `A user took a photo of a food item. Based on typical foods, analyze for fructose and sorbitol content.
                CRITICAL: Respond ONLY in ${targetLang}. Return a JSON analysis assuming it's a common food item.
                Return JSON with productName, fructoseLevel, fructoseAmount, sorbitolLevel, sorbitolAmount, ingredients array, safeAlternative, warnings array, overallRisk.`;
                const fallbackResult = await model.generateContent(fallbackPrompt);
                const fallbackText = fallbackResult.response.text();
                return JSON.parse(fallbackText.match(/\{[\s\S]*\}/)?.[0] || '{}');
            } catch (fallbackError) {
                console.error('Fallback also failed:', fallbackError);
            }
        }
        throw e;
    }
}

async function generateMenuWithGoogle(userRequest: string, lang: string): Promise<MenuPlan> {
    const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const targetLang = languageMapper[lang] || 'English';
    const prompt = `Generate a safe menu for fructose/sorbitol intolerance based on: "${userRequest}". 
    CRITICAL: Respond ONLY in ${targetLang}. All names, descriptions and notes must be in ${targetLang}.
    CRITICAL (Catalan): If language is Catalan, 'Snack' or 'Merienda' MUST be translated as 'Berenar'.
    Respond ONLY with JSON matching the MenuPlan structure.`;

    try {
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch (e) {
        console.error('Google menu error:', e);
        throw e;
    }
}

// --- OPENAI (GPT-4o) ---
async function analyzeWithOpenAI(input: { image?: string; text?: string }, lang: string): Promise<FoodAnalysisResult> {
    const targetLang = languageMapper[lang] || 'English';
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            {
                role: "user",
                content: [
                    { type: "text", text: `Analyze this food for fructose/sorbitol intolerance. CRITICAL: Respond ONLY in ${targetLang}. Return ONLY JSON.` },
                    input.image ? { type: "image_url", image_url: { url: `data:image/jpeg;base64,${input.image}` } } : { type: "text", text: input.text || "" }
                ] as any,
            },
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

async function generateMenuWithOpenAI(userRequest: string, lang: string): Promise<MenuPlan> {
    const targetLang = languageMapper[lang] || 'English';
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: `You are a nutritionist for fructose/sorbitol intolerance. CRITICAL: Respond ONLY in ${targetLang}. Return ONLY JSON. CRITICAL (Catalan): If targetLang is Catalan, 'Snack' or 'Merienda' MUST be translated as 'Berenar'.` },
            { role: "user", content: `Generate a menu for: ${userRequest}` }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

// --- PERPLEXITY (SONAR) ---
async function analyzeWithPerplexity(input: { image?: string; text?: string }, lang: string): Promise<FoodAnalysisResult> {
    const targetLang = languageMapper[lang] || 'English';

    const messages: any[] = [
        {
            role: "system",
            content: `You are a food analysis expert for fructose and sorbitol intolerance.
            CRITICAL: Respond ONLY in ${targetLang}.
            Return ONLY a valid JSON object.
            Schema:
            {
                "productName": "string",
                "fructoseLevel": "high"|"moderate"|"low"|"none",
                "fructoseAmount": "string",
                "sorbitolLevel": "high"|"moderate"|"low"|"none",
                "sorbitolAmount": "string",
                "ingredients": [{"name": "string", "risk": "high"|"moderate"|"safe"}],
                "safeAlternative": "string",
                "warnings": ["string"],
                "overallRisk": "high"|"moderate"|"low"|"safe"
            }`
        }
    ];

    if (input.image) {
        messages.push({
            role: "user",
            content: [
                { type: "text", text: `Analyze this food image: ${input.text || "Start analysis"}. Return ONLY JSON in ${targetLang}.` },
                { type: "image_url", image_url: { url: `data:image/jpeg;base64,${input.image}` } }
            ]
        });
    } else {
        messages.push({
            role: "user",
            content: `Analyze this food: ${input.text || "Food labels info"}. Return ONLY JSON in ${targetLang}.`
        });
    }

    const response = await perplexity.chat.completions.create({
        model: "sonar",
        messages: messages as any
    });

    const text = response.choices[0].message.content || '{}';
    console.log('Perplexity Analysis Raw Response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Perplexity response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Ensure arrays exist
    if (!parsed.ingredients || !Array.isArray(parsed.ingredients)) parsed.ingredients = [];
    if (!parsed.warnings || !Array.isArray(parsed.warnings)) parsed.warnings = [];

    return parsed as FoodAnalysisResult;
}

async function generateMenuWithPerplexity(userRequest: string, lang: string): Promise<MenuPlan> {
    const targetLang = languageMapper[lang] || 'English';
    const response = await perplexity.chat.completions.create({
        model: "sonar",
        messages: [
            {
                role: "system",
                content: `You are a specialized nutritionist. 
                CRITICAL: Respond ONLY in ${targetLang}.
                Return ONLY a valid JSON object.
                CRITICAL structure:
                {
                  "title": "Menu Name",
                  "days": [
                    {
                      "day": "Day 1",
                      "meals": {
                        "breakfast": {"name": "...", "description": "...", "ingredients": [], "safe": true},
                        "lunch": {"name": "...", "description": "...", "ingredients": [], "safe": true},
                        "snack": {"name": "...", "description": "...", "ingredients": [], "safe": true},
                        "dinner": {"name": "...", "description": "...", "ingredients": [], "safe": true}
                      }
                    }
                  ],
                  "notes": ["...", "..."]
                }`
            },
            { role: "user", content: `Generate a safe menu for fructose and sorbitol intolerance in ${targetLang}: ${userRequest}. CRITICAL: If Catalan, translate 'Snack'/'Merienda' as 'Berenar'.` }
        ]
    });

    const text = response.choices[0].message.content || '{}';
    console.log('Perplexity Raw Response:', text);

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found in Perplexity response');

    const parsed = JSON.parse(jsonMatch[0]);

    // Safety check for .map()
    if (!parsed.days || !Array.isArray(parsed.days)) {
        throw new Error('Perplexity response missing "days" array');
    }

    return parsed as MenuPlan;
}

export async function unifiedGenerateReport(data: any, lang: string = 'en'): Promise<string> {
    const preferredProvider = getProvider();
    const providers: AIProviderType[] = [preferredProvider, 'google', 'openai', 'perplexity'];
    const pList = [...new Set(providers)];

    // Convert data to string representation if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;

    for (const p of pList) {
        if (p === 'google' && !GOOGLE_API_KEY) continue;
        if (p === 'openai' && !OPENAI_API_KEY) continue;
        if (p === 'perplexity' && !PERPLEXITY_API_KEY) continue;

        try {
            console.log(`Generating report with ${p}...`);
            if (p === 'openai') {
                return await generateReportWithOpenAI(dataString, lang);
            } else if (p === 'perplexity') {
                return await generateReportWithPerplexity(dataString, lang);
            } else {
                return await generateReportWithGoogle(dataString, lang);
            }
        } catch (error) {
            console.error(`Provider ${p} failed for report generation:`, error);
        }
    }

    throw new Error('All AI providers failed to generate the report.');
}

// --- REPORT GENERATION PROMPT ---
const REPORT_SYSTEM_PROMPT = (targetLang: string) => `Ets un consultor expert i redactor d'informes corporatius d'alt nivell.
CRITICAL: Respond ONLY in ${targetLang}.
Crea un informe professional i detallat basat en les dades JSON o el text proporcionat. No inventis dades, escala i formata la informació existent per fer-la professional, extensa i estructurada.

ESTRUCTURA OBLIGATORIA:
---
TÍTOL (en majúscules, centrat visualment amb ===)
---
Introducció (Resum executiu del producte o pla de menú)
---
[DETALLS TÈCNICS / ANÀLISI DETALLAT]
Estructura les dades proporcionades en seccions clares.
Si és un menú, detalla cada àpat (Esmorzar, Dinar, Berenar, Sopar).
Si és una anàlisi de producte, detalla nivells de Fructosa/Sorbitol i ingredients.

---
Conclusió i recomanacions professionals.
---
[FIRMA] FRUCSOR Intelligent Systems, Pensat per tu, Data actual

REGLA LINGÜÍSTICA CRÍTICA (CATALÀ):
- "Snack" o "Merienda" s'han de traduir SEMPRE com a "Berenar".
- Utilitza un llenguatge formal, tècnic i precís.
- Longitud: Sigues extens (més de 800 paraules si les dades ho permeten), descrivint els riscos i beneficis basats en les dades.

Formata-ho per a un fitxer .TXT pur, amb salts de línia dobles i visualment net.`;

async function generateReportWithGoogle(dataString: string, lang: string): Promise<string> {
    const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const targetLang = languageMapper[lang] || 'English';
    const result = await model.generateContent([REPORT_SYSTEM_PROMPT(targetLang), `DADES PER L'INFORME: ${dataString}`]);
    return result.response.text();
}

async function generateReportWithOpenAI(dataString: string, lang: string): Promise<string> {
    const targetLang = languageMapper[lang] || 'English';
    const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: REPORT_SYSTEM_PROMPT(targetLang) },
            { role: "user", content: `Genera l'informe professional per a aquestes dades: ${dataString}` }
        ]
    });
    return response.choices[0].message.content || "";
}

async function generateReportWithPerplexity(dataString: string, lang: string): Promise<string> {
    const targetLang = languageMapper[lang] || 'English';
    const response = await perplexity.chat.completions.create({
        model: "sonar",
        messages: [
            { role: "system", content: REPORT_SYSTEM_PROMPT(targetLang) },
            { role: "user", content: `Genera l'informe professional per a aquestes dades: ${dataString}` }
        ]
    });
    return response.choices[0].message.content || "";
}

// --- ANTHROPIC (CLAUDE 3.5 SONNET) ---
async function analyzeWithAnthropic(input: { image?: string; text?: string }, lang: string): Promise<FoodAnalysisResult> {
    const targetLang = languageMapper[lang] || 'English';
    const content: any[] = [{ type: "text", text: `Analyze this food for fructose/sorbitol intolerance. CRITICAL: Respond ONLY in ${targetLang}. Return ONLY JSON.` }];

    if (input.image) {
        content.push({
            type: "image",
            source: {
                type: "base64",
                media_type: "image/jpeg",
                data: input.image,
            },
        });
    } else {
        content.push({ type: "text", text: input.text || "" });
    }

    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [{ role: "user", content }],
    });

    const text = (response.content[0] as any).text;
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
}

async function generateMenuWithAnthropic(userRequest: string, lang: string): Promise<MenuPlan> {
    const targetLang = languageMapper[lang] || 'English';
    const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20240620",
        max_tokens: 1024,
        messages: [
            { role: "user", content: `Generate a safe menu for fructose/sorbitol intolerance based on: "${userRequest}". CRITICAL: Respond ONLY in ${targetLang}. Respond ONLY with JSON.` }
        ],
    });

    const text = (response.content[0] as any).text;
    return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
}
