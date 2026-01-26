// Translations for FRUCSOR - Multilanguage Support
// Languages: Castellano (es), Català (ca), English (en)

export type Language = 'es' | 'ca' | 'en';

export const translations: Record<Language, Record<string, string>> = {
    // CASTELLANO
    es: {
        // General
        'app.title': 'FRUCSOR',
        'app.subtitle': 'Escáner de Fructosa y Sorbitol',
        'app.by': 'app por',

        // Login
        'login.title': 'Iniciar Sesión',
        'login.username': 'Usuario',
        'login.password': 'Contraseña',
        'login.submit': 'Entrar',
        'login.error.invalid': 'Usuario o contraseña incorrectos',
        'login.error.limit': 'Has alcanzado el límite de accesos semanales',
        'login.remaining': 'Accesos restantes esta semana',
        'login.unlimited': 'Acceso ilimitado',

        // Home
        'home.search': 'Buscar alimento...',
        'home.scan.title': 'HACER FOTO DE\nPRODUCTOS O PLATOS\nCOCINADOS',
        'home.scan.subtitle': 'Fructosa y Sorbitol',
        'home.barcode': 'Código de barras',
        'home.zeroTolerance': 'Modo\nTolerancia\nCero',
        'home.planner': 'PLANIFICADOR\nSEMANAL',
        'home.safeProfile': 'Perfil Seguro\nActivo',
        'home.marketInsights': 'Información del Mercado',

        // Analysis
        'analysis.title': 'Resultado del Análisis',
        'analysis.productName': 'Nombre del Producto',
        'analysis.highFructose': 'Alta Fructosa',
        'analysis.moderateSorbitol': 'Sorbitol Moderado',
        'analysis.lowFructose': 'Baja Fructosa',
        'analysis.lowSorbitol': 'Bajo Sorbitol',
        'analysis.noFructose': 'Sin Fructosa',
        'analysis.noSorbitol': 'Sin Sorbitol',
        'analysis.per100': 'por 100ml detectados',
        'analysis.ingredients': 'Ingredientes',
        'analysis.safeAlternative': 'Alternativa Segura',
        'analysis.download': 'Descargar Resultados',
        'analysis.analyzing': 'Analizando...',
        'analysis.takePhoto': 'Tomar Foto',
        'analysis.uploadImage': 'Subir Imagen',
        'analysis.warning': 'Advertencia',

        // Scan
        'scan.title': 'Foto de productos o platos cocinados',
        'scan.instructions': 'Fotografía la etiqueta nutricional o el plato',
        'scan.capture': 'Capturar',
        'scan.upload': 'Subir Imagen',
        'scan.analyzing': 'Analizando con IA...',

        // Barcode
        'barcode.title': 'Escáner de Códigos',
        'barcode.instructions': 'Apunta al código de barras del producto',
        'barcode.searching': 'Buscando producto...',
        'barcode.notFound': 'Producto no encontrado',

        // Planner
        'planner.title': 'Planificador Semanal',
        'planner.yourMenu': 'Tu Menú Seguro',
        'planner.tailored': 'Adaptado para sensibilidad a Fructosa y Sorbitol',
        'planner.askAI': 'Pedir menú a la IA para el Domingo',
        'planner.popularSafe': 'Opciones Seguras Populares',
        'planner.fructoseSafe': 'Seguro - Fructosa',
        'planner.sorbitolFree': 'Libre de Sorbitol',
        'planner.breakfast': 'Desayuno',
        'planner.lunch': 'Almuerzo',
        'planner.dinner': 'Cena',
        'planner.snack': 'Merienda',
        'planner.ideal': 'Describe tu menú ideal',
        'planner.example': 'Ej: Menú semanal vegetariano para 5 días, bajo en fructosa...',
        'planner.tip': '💡 Puedes pedir menús diarios, semanales, vegetarianos, sin gluten, etc.',
        'planner.generate': 'Generar Menú o platos',
        'planner.generating': 'Generando menú...',
        'planner.suggestions': 'Sugerencias rápidas:',
        'planner.generatedByAI': 'Pensado para ti • Seguro para fructosa/sorbitol',
        'planner.importantNotes': 'Notas Importantes',

        // Days
        'day.mon': 'Lun',
        'day.tue': 'Mar',
        'day.wed': 'Mié',
        'day.thu': 'Jue',
        'day.fri': 'Vie',
        'day.sat': 'Sáb',
        'day.sun': 'Dom',

        // Navigation
        'nav.home': 'Inicio',
        'nav.history': 'Historial',
        'nav.favorites': 'Favoritos',
        'nav.planner': 'Planificador',

        // Common
        'common.close': 'Cerrar',
        'common.cancel': 'Cancelar',
        'common.confirm': 'Confirmar',
        'common.back': 'Atrás',
        'common.loading': 'Cargando...',
        'common.error': 'Error',
        'common.success': 'Éxito',
        'common.logout': 'Cerrar Sesión',
    },

    // CATALÀ
    ca: {
        // General
        'app.title': 'FRUCSOR',
        'app.subtitle': 'Escàner de Fructosa i Sorbitol',
        'app.by': 'app per',

        // Login
        'login.title': 'Iniciar Sessió',
        'login.username': 'Usuari',
        'login.password': 'Contrasenya',
        'login.submit': 'Entrar',
        'login.error.invalid': 'Usuari o contrasenya incorrectes',
        'login.error.limit': 'Has assolit el límit d\'accessos setmanals',
        'login.remaining': 'Accessos restants aquesta setmana',
        'login.unlimited': 'Accés il·limitat',

        // Home
        'home.search': 'Cerca un aliment...',
        'home.scan.title': 'FER FOTO DE\nPRODUCTES O PLATS\nCUINATS',
        'home.scan.subtitle': 'Fructosa i Sorbitol',
        'home.barcode': 'Codi de barres',
        'home.zeroTolerance': 'Mode\nTolerància\nZero',
        'home.planner': 'PLANIFICADOR\nSETMANAL',
        'home.safeProfile': 'Perfil Segur\nActiu',
        'home.marketInsights': 'Informació del Mercat',

        // Analysis
        'analysis.title': 'Resultat de l\'Anàlisi',
        'analysis.productName': 'Nom del Producte',
        'analysis.highFructose': 'Alta Fructosa',
        'analysis.moderateSorbitol': 'Sorbitol Moderat',
        'analysis.lowFructose': 'Baixa Fructosa',
        'analysis.lowSorbitol': 'Baix Sorbitol',
        'analysis.noFructose': 'Sense Fructosa',
        'analysis.noSorbitol': 'Sense Sorbitol',
        'analysis.per100': 'per 100ml detectats',
        'analysis.ingredients': 'Ingredients',
        'analysis.safeAlternative': 'Alternativa Segura',
        'analysis.download': 'Descarregar Resultats',
        'analysis.analyzing': 'Analitzant...',
        'analysis.takePhoto': 'Fer Foto',
        'analysis.uploadImage': 'Pujar Imatge',
        'analysis.warning': 'Advertència',

        // Scan
        'scan.title': 'Foto de productes o plats cuinats',
        'scan.instructions': 'Fotografia l\'etiqueta nutricional o el plat',
        'scan.capture': 'Capturar',
        'scan.upload': 'Pujar Imatge',
        'scan.analyzing': 'Analitzant amb IA...',

        // Barcode
        'barcode.title': 'Escàner de Codis',
        'barcode.instructions': 'Apunta al codi de barres del producte',
        'barcode.searching': 'Cercant producte...',
        'barcode.notFound': 'Producte no trobat',

        // Planner
        'planner.title': 'Planificador Setmanal',
        'planner.yourMenu': 'El Teu Menú Segur',
        'planner.tailored': 'Adaptat per a sensibilitat a Fructosa i Sorbitol',
        'planner.askAI': 'Demanar menú a la IA per Diumenge',
        'planner.popularSafe': 'Opcions Segures Populars',
        'planner.fructoseSafe': 'Segur - Fructosa',
        'planner.sorbitolFree': 'Lliure de Sorbitol',
        'planner.breakfast': 'Esmorzar',
        'planner.lunch': 'Dinar',
        'planner.dinner': 'Sopar',
        'planner.snack': 'Berenar',
        'planner.ideal': 'Descriu el teu menú ideal',
        'planner.example': 'Ex: Menú setmanal vegetarià per a 5 dies, baix en fructosa...',
        'planner.tip': '💡 Pots demanar menús diaris, setmanals, vegetarians, sense gluten, etc.',
        'planner.generate': 'Generar Menú o plats',
        'planner.generating': 'Generant menú...',
        'planner.suggestions': 'Suggeriments ràpids:',
        'planner.generatedByAI': 'Pensat per tu • Segur per a fructosa/sorbitol',
        'planner.importantNotes': 'Notes Importants',

        // Days
        'day.mon': 'Dll',
        'day.tue': 'Dm',
        'day.wed': 'Dc',
        'day.thu': 'Dj',
        'day.fri': 'Dv',
        'day.sat': 'Ds',
        'day.sun': 'Dg',

        // Navigation
        'nav.home': 'Inici',
        'nav.history': 'Historial',
        'nav.favorites': 'Favorits',
        'nav.planner': 'Planificador',

        // Common
        'common.close': 'Tancar',
        'common.cancel': 'Cancel·lar',
        'common.confirm': 'Confirmar',
        'common.back': 'Enrere',
        'common.loading': 'Carregant...',
        'common.error': 'Error',
        'common.success': 'Èxit',
        'common.logout': 'Tancar Sessió',
    },

    // ENGLISH
    en: {
        // General
        'app.title': 'FRUCSOR',
        'app.subtitle': 'Fructose & Sorbitol Scanner',
        'app.by': 'app by',

        // Login
        'login.title': 'Sign In',
        'login.username': 'Username',
        'login.password': 'Password',
        'login.submit': 'Sign In',
        'login.error.invalid': 'Invalid username or password',
        'login.error.limit': 'You have reached the weekly access limit',
        'login.remaining': 'Remaining accesses this week',
        'login.unlimited': 'Unlimited access',

        // Home
        'home.search': 'Search food...',
        'home.scan.title': 'TAKE PHOTO OF\nPRODUCTS OR\nCOOKED DISHS',
        'home.scan.subtitle': 'Fructose & Sorbitol',
        'home.barcode': 'Barcode',
        'home.zeroTolerance': 'Zero\nTolerance\nMode',
        'home.planner': 'WEEKLY\nPLANNER',
        'home.safeProfile': 'Safe Profile\nActive',
        'home.marketInsights': 'Market Insights',

        // Analysis
        'analysis.title': 'Analysis Result',
        'analysis.productName': 'Product Name',
        'analysis.highFructose': 'High Fructose',
        'analysis.moderateSorbitol': 'Moderate Sorbitol',
        'analysis.lowFructose': 'Low Fructose',
        'analysis.lowSorbitol': 'Low Sorbitol',
        'analysis.noFructose': 'No Fructose',
        'analysis.noSorbitol': 'No Sorbitol',
        'analysis.per100': 'per 100ml detected',
        'analysis.ingredients': 'Ingredients',
        'analysis.safeAlternative': 'Safe Alternative',
        'analysis.download': 'Download Results',
        'analysis.analyzing': 'Analysing...',
        'analysis.takePhoto': 'Take Photo',
        'analysis.uploadImage': 'Upload Image',
        'analysis.warning': 'Warning',

        // Scan
        'scan.title': 'Photo of products or cooked dishes',
        'scan.instructions': 'Take a photo of the nutritional label or dish',
        'scan.capture': 'Capture',
        'scan.upload': 'Upload Image',
        'scan.analyzing': 'Analysing with AI...',

        // Barcode
        'barcode.title': 'Barcode Scanner',
        'barcode.instructions': 'Point at the product barcode',
        'barcode.searching': 'Searching product...',
        'barcode.notFound': 'Product not found',

        // Planner
        'planner.title': 'Weekly Planner',
        'planner.yourMenu': 'Your Safe Menu',
        'planner.tailored': 'Tailored for Fructose & Sorbitol sensitivity',
        'planner.askAI': 'Ask AI for Sunday Menu',
        'planner.popularSafe': 'Popular Safe Options',
        'planner.fructoseSafe': 'Fructose Safe',
        'planner.sorbitolFree': 'Sorbitol Free',
        'planner.breakfast': 'Breakfast',
        'planner.lunch': 'Lunch',
        'planner.dinner': 'Dinner',
        'planner.snack': 'Snack',
        'planner.ideal': 'Describe your ideal menu',
        'planner.example': 'e.g. 5-day vegetarian weekly menu, low in fructose...',
        'planner.tip': '💡 You can request daily or weekly menus, vegetarian, gluten-free, etc.',
        'planner.generate': 'Generate Menu or dishes',
        'planner.generating': 'Generating menu...',
        'planner.suggestions': 'Quick suggestions:',
        'planner.generatedByAI': 'Designed for you • Safe for fructose/sorbitol',
        'planner.importantNotes': 'Important Notes',

        // Days
        'day.mon': 'Mon',
        'day.tue': 'Tue',
        'day.wed': 'Wed',
        'day.thu': 'Thu',
        'day.fri': 'Fri',
        'day.sat': 'Sat',
        'day.sun': 'Sun',

        // Navigation
        'nav.home': 'Home',
        'nav.history': 'History',
        'nav.favorites': 'Favourites',
        'nav.planner': 'Planner',

        // Common
        'common.close': 'Close',
        'common.cancel': 'Cancel',
        'common.confirm': 'Confirm',
        'common.back': 'Back',
        'common.loading': 'Loading...',
        'common.error': 'Error',
        'common.success': 'Success',
        'common.logout': 'Sign Out',
    },
};

export const getTranslation = (lang: Language, key: string): string => {
    return translations[lang][key] || key;
};
