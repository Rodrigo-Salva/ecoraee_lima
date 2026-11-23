# EcoRAEE Lima

MVP front-end académico para ayudar a la ciudadanía de Lima Metropolitana a identificar residuos de aparatos eléctricos y electrónicos (RAEE), encontrar puntos de entrega y registrar entregas demostrativas. El proyecto corresponde al curso **Sociedad y Desarrollo Sostenible** de TECSUP y se relaciona con el ODS 12.

> EcoRAEE es una herramienta informativa de apoyo. No reemplaza a las municipalidades ni a los operadores autorizados. Los puntos, campañas, usuarios, indicadores y comprobantes marcados como ejemplo son datos ficticios del prototipo; deben validarse con fuentes oficiales antes de un uso real.

## Funcionalidades incluidas

### Experiencia ciudadana

- Portada responsive con cifras documentadas, encuesta exploratoria, ODS 12, búsqueda rápida por distrito y animaciones accesibles.
- Mapa Leaflet/OpenStreetMap con 25 puntos de ejemplo, agrupación visual, filtros, geolocalización, ruta referencial, pantalla completa y vista lista/mapa.
- Favoritos persistentes, comparación de hasta tres puntos, detalle compartible y formulario para reportar o sugerir información.
- Asistente de cuatro preguntas que recomienda reparar, donar o entregar y muestra los tres puntos compatibles más próximos.
- Buscador local “¿Puedo reciclar esto?” con 40 artículos y orientación de disposición.
- Registro de entregas con varios equipos, estados declarado/confirmado/rechazado, línea de tiempo, totales, CSV y constancia PDF demostrativa.
- Nueve campañas, suscripción por distrito, avisos locales y opción de compartir.
- Módulo educativo, FAQ, guía de seguridad y quiz con mejor puntaje persistente.
- Directorio de ocho operadores de ejemplo, indicadores ambientales y encuesta de satisfacción.

### Roles demostrativos

- **Ciudadano:** mapa, asistente, campañas, aprendizaje, entregas e indicadores.
- **Punto de recolección:** bandeja de entregas, confirmación o rechazo, pesos confirmados, filtros y resumen gráfico.
- **Administrador:** gestión local de puntos y campañas, revisión de reportes/sugerencias, métricas y exportación.

El selector de rol está en la cabecera. No existe autenticación real: el cambio de rol solo permite demostrar recorridos del MVP.

## Instalación

Requisitos: Node.js 20 o superior y npm.

```bash
npm install
npm run dev
```

Vite mostrará la URL local, normalmente `http://localhost:5173`.

Comprobaciones de calidad:

```bash
npm run lint
npm run test
npm run build
```

El comando de compilación genera la versión desplegable en `dist/`. El proyecto incluye configuración de rutas SPA para Netlify (`public/_redirects`) y Vercel (`vercel.json`).

## Guía de demostración de 3 minutos

1. **0:00–0:35 — Portada y búsqueda.** Explica el problema RAEE, selecciona un distrito en la portada y abre el mapa.
2. **0:35–1:05 — Mapa.** Activa “Cerca de mí” o usa filtros, guarda un favorito y compara dos puntos. Abre el detalle de uno.
3. **1:05–1:35 — Asistente.** Entra a “¿Qué hago con mi equipo?”, responde las cuatro preguntas y usa “Registrar entrega”.
4. **1:35–2:05 — Entrega.** Agrega más de un equipo, guarda la declaración y muestra la línea de tiempo, CSV y constancia PDF.
5. **2:05–2:30 — Operación.** Cambia al rol Punto, abre su panel y confirma o rechaza una entrega pendiente.
6. **2:30–2:50 — Administración.** Cambia a Administrador y enseña la gestión de datos, reportes, sugerencias e indicadores.
7. **2:50–3:00 — Cierre.** Vuelve a Indicadores o Acerca de, destaca que los datos son demostrativos y muestra “Restablecer demo”.

## Datos y persistencia

No existe backend ni inicio de sesión. La actividad se guarda únicamente en `localStorage` con claves versionadas: entregas, roles, favoritos, suscripciones, visitas, reportes, sugerencias, quiz y satisfacción. En **Acerca del proyecto** se puede restablecer toda la demostración.

Las ubicaciones, campañas y operadores adicionales son ejemplos locales. Las estadísticas externas conservan su fuente y año en la interfaz.

## Estructura

```text
src/
├── components/  Layout, mapa y componentes reutilizables
├── context/     Estado global y acciones del prototipo
├── data/        Puntos, campañas, operadores, estadísticas y contenidos
├── hooks/       Persistencia con localStorage
├── pages/       Rutas ciudadanas, de punto y de administración
├── test/        Configuración y pruebas automatizadas
├── types/       Modelos TypeScript
└── utils/       Filtros, distancias, fechas, exportaciones y métricas
```

## Tecnologías

React 19, Vite, TypeScript, Tailwind CSS, React Router, Leaflet, react-leaflet, OpenStreetMap, Recharts, Lucide, jsPDF y Vitest.

## Créditos

- Ronaldo Meza Pastrana
- Rodrigo Salva Saccatoma
- Docente: Kervin Manco Ponciano
- TECSUP · Diseño y Desarrollo de Software · 2026-II

## Siguientes pasos para producción

Backend y base de datos, autenticación y autorización reales, integración con registros oficiales, verificación de operadores y puntos, moderación, analítica consentida, pruebas de usabilidad, auditoría de accesibilidad y políticas formales de privacidad y seguridad.
