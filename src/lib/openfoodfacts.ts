// Open Food Facts API client for barcode product lookup

export interface OpenFoodFactsProduct {
    code: string;
    product_name: string;
    brands: string;
    image_url: string;
    ingredients_text: string;
    nutriments: {
        sugars_100g?: number;
        fructose_100g?: number;
        carbohydrates_100g?: number;
        polyols_100g?: number;
    };
    ingredients: Array<{
        id: string;
        text: string;
    }>;
}

export interface ProductResult {
    found: boolean;
    product?: {
        name: string;
        brand: string;
        imageUrl: string;
        ingredients: string;
        sugars: number | null;
        fructose: number | null;
        polyols: number | null;
        fructoseRisk: 'high' | 'moderate' | 'low' | 'unknown';
        sorbitolRisk: 'high' | 'moderate' | 'low' | 'unknown';
        rawIngredients: string[];
    };
}

// High-fructose ingredients to check for
const HIGH_FRUCTOSE_INGREDIENTS = [
    'high fructose corn syrup',
    'hfcs',
    'glucose-fructose syrup',
    'fructose-glucose syrup',
    'isoglucose',
    'agave',
    'honey',
    'apple juice concentrate',
    'pear juice concentrate',
    'grape juice concentrate',
];

// Sorbitol-related ingredients
const SORBITOL_INGREDIENTS = [
    'sorbitol',
    'e420',
    'maltitol',
    'e965',
    'xylitol',
    'mannitol',
    'e421',
    'isomalt',
    'e953',
    'polyol',
];

function assessFructoseRisk(product: OpenFoodFactsProduct): 'high' | 'moderate' | 'low' | 'unknown' {
    const ingredientsLower = (product.ingredients_text || '').toLowerCase();

    // Check for high-fructose ingredients
    for (const ingredient of HIGH_FRUCTOSE_INGREDIENTS) {
        if (ingredientsLower.includes(ingredient)) {
            return 'high';
        }
    }

    // Check nutriment values
    const sugars = product.nutriments?.sugars_100g;
    const fructose = product.nutriments?.fructose_100g;

    if (fructose !== undefined) {
        if (fructose > 10) return 'high';
        if (fructose > 5) return 'moderate';
        return 'low';
    }

    if (sugars !== undefined) {
        // Estimate fructose as roughly half of total sugars
        if (sugars > 20) return 'high';
        if (sugars > 10) return 'moderate';
        if (sugars > 5) return 'low';
        return 'low';
    }

    return 'unknown';
}

function assessSorbitolRisk(product: OpenFoodFactsProduct): 'high' | 'moderate' | 'low' | 'unknown' {
    const ingredientsLower = (product.ingredients_text || '').toLowerCase();

    // Check for sorbitol ingredients
    for (const ingredient of SORBITOL_INGREDIENTS) {
        if (ingredientsLower.includes(ingredient)) {
            return 'high';
        }
    }

    // Check polyols
    const polyols = product.nutriments?.polyols_100g;
    if (polyols !== undefined) {
        if (polyols > 5) return 'high';
        if (polyols > 2) return 'moderate';
        return 'low';
    }

    return 'low'; // If no polyols detected, assume low risk
}

export async function getProductByBarcode(barcode: string): Promise<ProductResult> {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`
        );

        if (!response.ok) {
            return { found: false };
        }

        const data = await response.json();

        if (data.status !== 1 || !data.product) {
            return { found: false };
        }

        const product = data.product as OpenFoodFactsProduct;

        return {
            found: true,
            product: {
                name: product.product_name || 'Unknown Product',
                brand: product.brands || 'Unknown Brand',
                imageUrl: product.image_url || '',
                ingredients: product.ingredients_text || '',
                sugars: product.nutriments?.sugars_100g ?? null,
                fructose: product.nutriments?.fructose_100g ?? null,
                polyols: product.nutriments?.polyols_100g ?? null,
                fructoseRisk: assessFructoseRisk(product),
                sorbitolRisk: assessSorbitolRisk(product),
                rawIngredients: product.ingredients?.map(i => i.text) || [],
            },
        };
    } catch (error) {
        console.error('Error fetching product:', error);
        return { found: false };
    }
}
