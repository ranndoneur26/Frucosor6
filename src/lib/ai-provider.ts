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
    try {
        const provider = getProvider();

        if (provider === 'openai') {
            return await generateMenuWithOpenAI(userRequest, lang);
        } else if (provider === 'anthropic') {
            return await generateMenuWithAnthropic(userRequest, lang);
        } else if (provider === 'perplexity') {
            return await generateMenuWithPerplexity(userRequest, lang);
        } else {
            return await generateMenuWithGoogle(userRequest, lang);
        }
    } catch (error) {
        console.error('Unified menu generation error, returning mock menu:', error);
        return getMockMenu(userRequest);
    }
}

function getMockMenu(userRequest: string): MenuPlan {
    return {
        title: `Menú Seguro - ${userRequest}`,
        days: [
            {
                day: "Día 1",
                meals: {
                    breakfast: {
                        name: "Quinoa Porridge con Arándanos",
                        description: "Quinoa cocida con leche sin lactosa, arándanos frescos y canela",
                        ingredients: ["Quinoa", "Leche sin lactosa", "Arándanos", "Canela"],
                        safe: true
                    },
                    lunch: {
                        name: "Pollo a la Plancha con Arroz",
                        description: "Pechuga de pollo con arroz basmati y verduras al vapor",
                        ingredients: ["Pollo", "Arroz basmati", "Zanahorias", "Judías verdes"],
                        safe: true
                    },
                    snack: {
                        name: "Yogur Natural con Nueces",
                        description: "Yogur sin azúcar con nueces picadas",
                        ingredients: ["Yogur natural", "Nueces"],
                        safe: true
                    },
                    dinner: {
                        name: "Salmón al Horno con Patatas",
                        description: "Filete de salmón con patatas asadas y espinacas",
                        ingredients: ["Salmón", "Patatas", "Espinacas", "Aceite de oliva"],
                        safe: true
                    }
                }
            }
        ],
        notes: [
            "⚠️ NOTA: Este es un menú de ejemplo. La generación con IA puede estar experimentando problemas.",
            "Para activar la generación personalizada con IA, verifica que tus API keys tengan acceso a los modelos seleccionados.",
            "Todos los alimentos sugeridos son seguros para intolerancia a fructosa y sorbitol."
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
    const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const targetLang = languageMapper[lang] || 'English';

    const prompt = `Analyze this food ${input.image ? 'label image' : 'description'}: "${input.text || ''}"
  CRITICAL: Respond ONLY in ${targetLang}. All values in the JSON must be in ${targetLang}.
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
            result = await model.generateContent([
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: input.image } }
            ]);
        } else {
            result = await model.generateContent(prompt);
        }

        const text = result.response.text();
        return JSON.parse(text.match(/\{[\s\S]*\}/)?.[0] || '{}');
    } catch (e) {
        console.error('Google analysis error:', e);
        throw e;
    }
}

async function generateMenuWithGoogle(userRequest: string, lang: string): Promise<MenuPlan> {
    const model = googleAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    const targetLang = languageMapper[lang] || 'English';
    const prompt = `Generate a safe menu for fructose/sorbitol intolerance based on: "${userRequest}". 
    CRITICAL: Respond ONLY in ${targetLang}. All names, descriptions and notes must be in ${targetLang}.
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
            { role: "system", content: `You are a nutritionist for fructose/sorbitol intolerance. CRITICAL: Respond ONLY in ${targetLang}. Return ONLY JSON.` },
            { role: "user", content: `Generate a menu for: ${userRequest}` }
        ],
        response_format: { type: "json_object" }
    });

    return JSON.parse(response.choices[0].message.content || '{}');
}

// --- PERPLEXITY (SONAR) ---
async function analyzeWithPerplexity(input: { image?: string; text?: string }, lang: string): Promise<FoodAnalysisResult> {
    // Perplexity typically doesn't support images in their API yet, so we fallback to text
    const targetLang = languageMapper[lang] || 'English';
    const response = await perplexity.chat.completions.create({
        model: "sonar",
        messages: [
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
            },
            { role: "user", content: `Analyze this food: ${input.text || "Food labels info"}. Return ONLY JSON in ${targetLang}.` }
        ]
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
            { role: "user", content: `Generate a safe menu for fructose and sorbitol intolerance in ${targetLang}: ${userRequest}` }
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
    const provider = getProvider();

    // Convert data to string representation if it's an object
    const dataString = typeof data === 'object' ? JSON.stringify(data, null, 2) : data;

    if (provider === 'openai') {
        return generateReportWithOpenAI(dataString, lang);
    } else if (provider === 'perplexity') {
        return generateReportWithPerplexity(dataString, lang);
    } else {
        return generateReportWithGoogle(dataString, lang);
    }
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
