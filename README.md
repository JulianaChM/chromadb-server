# CodeBlueAI - Sistema Inteligente de Gestión de Emergencias

CodeBlueAI es una plataforma avanzada diseñada para optimizar la coordinación de emergencias médicas en Manizales, Colombia, utilizando Inteligencia Artificial y algoritmos de optimización de rutas.

## 🚀 Despacho Inteligente con A* (Nivel 2 & 3)

El sistema ha evolucionado de una asignación basada en proximidad a una **Optimización Global de Estados** utilizando el algoritmo A*.

### 🧠 Lógica de Selección
El motor de decisión en `src/lib/a-star.ts` evalúa el costo total del ciclo de emergencia:
1. **Segmento A**: Ambulancia -> Incidente.
2. **Segmento B**: Incidente -> Hospital Óptimo.

A* garantiza la selección de la pareja (Ambulancia, Hospital) que minimiza el tiempo total de atención al paciente, utilizando una función heurística basada en distancias euclidianas para optimizar la búsqueda.

### 📊 Sistema de Métricas y Evaluación
En la sección de **Reportes/Evaluación**, se realiza una comparativa académica en tiempo real:
- **Eficiencia de Exploración**: Conteo de nodos expandidos (A* vs BFS).
- **Rendimiento Computacional**: Tiempo de ejecución en milisegundos.
- **Optimización de Costos**: Validación de la solución de menor costo acumulado.

## Funcionalidades Implementadas

### 🚑 Registro de Incidentes (Público)
- **Ruta:** `/registro-incidente`
- Formulario con geolocalización automática vía GPS o Nominatim.
- Envío de datos a flujo externo en **n8n** para triaje.
- Persistencia inmediata en **Firebase Firestore**.

### 🖥️ Centro de Mando (Dashboard)
- **Mapa en Tiempo Real**: Visualización interactiva con Leaflet.
- **Simulación de Despacho**: Animación del flujo de la unidad desde la base hasta el hospital.
- **Gestión de Recursos**: Monitoreo de estados de flota y ocupación hospitalaria.

### 🤖 Asistente de IA con RAG
- **Tecnología**: LangChain + Google Gemini 1.5 Flash.
- **Memoria Histórica**: Sistema de RAG que permite consultar incidentes pasados almacenados en la base vectorial LanceDB.

## Stack Tecnológico
- **Frontend**: Next.js 15, React 19, Tailwind CSS, ShadCN UI.
- **Base de Datos**: Firebase (Firestore + Auth).
- **IA/ML**: LangChain, LanceDB (Vector Store), Google Gemini.
- **Mapas**: React-Leaflet / OSRM API.
- **Algoritmos**: A* (Pathfinding de estados), BFS (Comparativa).

---
*Desarrollado para maximizar la eficiencia y salvar vidas mediante tecnología de vanguardia.*