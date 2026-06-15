# CodeBlueAI - Sistema Inteligente de Gestión de Emergencias

CodeBlueAI es una plataforma avanzada diseñada para optimizar la coordinación de emergencias médicas en Manizales, Colombia, utilizando Inteligencia Artificial y algoritmos de optimización de rutas.

## Funcionalidades Implementadas

### 🚑 Registro de Incidentes (Público)
- **Ruta:** `/registro-incidente`
- Formulario público para reporte de emergencias.
- Selección de tipo de incidente y nivel de prioridad (Normal, Moderado, Alto, Crítico).
- Ingreso manual de dirección para despacho inmediato.
- Envío de datos a flujo externo en **n8n** para triaje automatizado.

### 🖥️ Centro de Mando (Dashboard)
- **Acceso:** Protegido por login (`admin@codeblue.ai` / `admin123`).
- **Resumen Estadístico:** Visualización de emergencias activas, tiempo de respuesta y estado de flota mediante gráficos de Recharts.
- **Gestión de Recursos:** Tablas interactivas para el monitoreo de ambulancias y capacidad hospitalaria.

### 📍 Mapa de Despacho e Inteligencia A*
- **Visualización:** Mapa interactivo basado en **Leaflet** centrado en Manizales.
- **Algoritmo A*:** Implementación personalizada en TypeScript para encontrar la ruta óptima entre el origen (ambulancia) y el destino (hospital).
- **Cálculo de Métricas:** Generación de waypoints, costo de nodos y tiempo estimado de llegada.

### 🤖 Asistente de IA con RAG
- **Tecnología:** Integración con **n8n** y **ChromaDB**.
- **Memoria Histórica:** Sistema de RAG (Retrieval-Augmented Generation) que permite a los operadores consultar incidentes pasados almacenados en **Firestore**.
- **Sincronización:** Carga automática de historial médico hacia la base de datos vectorial al iniciar el sistema.

## Stack Tecnológico
- **Frontend:** Next.js 15 (Turbopack), React 19, Tailwind CSS.
- **Componentes:** ShadCN UI (Radix UI + Lucide Icons).
- **Mapas:** React-Leaflet / OpenStreetMap.
- **Base de Datos:** Firebase (Firestore + Authentication).
- **IA/ML:** LangChain, ChromaDB, Integración con n8n.
- **Algoritmos:** A* (Pathfinding personalizado).

---
*Desarrollado para optimizar cada segundo en situaciones críticas.*