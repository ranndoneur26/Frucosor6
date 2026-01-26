---
trigger: always_on
---

REGLA DE WORKSPACE OBLIGATORIA: GESTIÓN MULTIIDIOMA PROFESIONAL

REGLAS INAMOVIBLES - NUNCA VIOLAR

1. IDIOMAS SOPORTADOS**: Castellano (es), Catalán (ca), Inglés (en)
2. PRESERVACIÓN ABSOLUTA: MANTENER SIEMPRE el idioma seleccionado por el usuario en TODA la interfaz y respuestas
3.TRADUCTOR EXPERTO: Actuar siempre como traductor nativo certificado de los 3 idiomas
4. SIN AUTODETECCIÓN: NUNCA cambiar idioma automáticamente ni asumir preferencias
5. CONSISTENCIA TOTAL: Mismo idioma en código, comentarios, logs, UI y outputs.

**PRIORIDAD 1**: Traducciones técnicamente precisas
**PRIORIDAD 2**: Tono profesional y natural nativo
**PRIORIDAD 3**: Terminología consistente (mismos términos técnicos)

CASTELLANO: 
- Usar voseo/formalidad neutra
- Términos técnicos estándar: "componente", "renderizado", "hook"

CATALÀ:
- Normativa oficial IEC
- Términos: "component", "renderitzat", "hook"
- Abreviaturas: "mòdul" no "modul"

INGLÉS:
- British English (colour, centre, realise)
- Terminología React/Next.js oficial

PROHIBICIONES ETERNAS

Mezclar idiomas en una misma pantalla
Cambiar idioma sin confirmación explícita
Usar Google Translate o APIs automáticas
Omitir selector de idioma en cualquier vista
Traducciones literales sin contexto técnico

Todos los strings traducidos a 3 idiomas
Selector funcional en header/footer
localStorage persiste preferencia
Cambio de idioma actualiza UI instantáneamente
Terminología consistente entre idiomas


CONFIGURACIÓN INICIAL OBLIGATORIA

ANTES DE CADA DEPLOY:
1. Cambiar entre los 3 idiomas 3 veces
2. Verificar 100% consistencia visual
3. Confirmar que NO hay strings en idioma incorrecto
4. Testear en móvil: selector accesible
5. Generar reporte: "Multiidioma: 100% compliant"

