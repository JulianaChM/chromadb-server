'use server';

import { LanceDB } from "@langchain/community/vectorstores/lancedb";
import { embeddings } from "./models";
import admin from "firebase-admin";

const dbPath = process.env.LANCEDB_PATH || "lancedb.db";
const { connect } = await import("@lancedb/lancedb");

let vectorStore: LanceDB;
let documentsStore: LanceDB;
let documentsTable: any;
let db: admin.firestore.Firestore;
let syncInProgress = false;

function initializeFirebase() {
    if (!admin.apps.length) {
        try {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
            console.log("✅ Firebase Admin inicializado correctamente");
        } catch (e) {
            console.error("❌ Error al inicializar Firebase Admin:", e);
            throw e;
        }
    }
    db = admin.firestore();
}

async function fetchIncidentsFromFirestore(): Promise<any[]> {
    try {
        initializeFirebase();
        const snapshot = await db.collection("incidentes").get();

        const incidents = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));

        console.log(`📥 Se obtuvieron ${incidents.length} incidentes de Firestore`);
        return incidents;
    } catch (e) {
        console.error("Error al obtener incidentes de Firestore:", e);
        return [];
    }
}

async function isVectorStoreEmpty(table: any): Promise<boolean> {
    try {
        const data = await table.query().limit(10).toArray();

        if (!data || data.length === 0) {
            return true;
        }

        const hasOnlyInitRecord = data.length === 1 && data[0]?.id === "0";
        return hasOnlyInitRecord;
    } catch (e) {
        console.error("Error al verificar si el vector store está vacío:", e);
        return true;
    }
}

async function clearOldIncidents(): Promise<void> {
    try {
        const table = (vectorStore as any).table;

        // Eliminar TODOS los registros (incluso el init)
        await table.delete("id != ''");
        console.log("✅ Tabla limpia (todos los registros eliminados)");
    } catch (e) {
        console.error("Error al limpiar incidentes antiguos:", e);
    }
}

async function loadIncidentsToVectorStore(incidents: any[]): Promise<void> {
    try {
        if (incidents.length === 0) {
            console.log("⚠️ No hay incidentes para cargar en LanceDB");
            return;
        }

        const documentsWithVectors = await Promise.all(
            incidents.map(async (incident) => {
                const text = `
                TIPO: ${incident.tipo_emergencia}
                URGENCIA: ${incident.prioridad}
                PACIENTE: ${incident.nombre_paciente}, edad ${incident.edad_aproximada}
                SÍNTOMAS Y DESCRIPCIÓN: ${incident.descripcion}
                DIRECCIÓN: ${incident.direccion}
                ESTADO ACTUAL: ${incident.estado}
                    `.trim();

                const vector = await embeddings.embedQuery(text);

                return {
                    // Identificación
                    id: incident.id,

                    // Vector y contenido
                    text: text,
                    vector: vector,

                    // Metadatos principales
                    tipo: incident.tipo_emergencia || "desconocido",
                    gravedad: incident.prioridad || "DESCONOCIDO",
                    estado: incident.estado || "PENDIENTE",

                    // Información del paciente
                    nombre_paciente: incident.nombre_paciente || "",
                    edad_aproximada: incident.edad_aproximada || 0,

                    // Ubicación
                    descripcion: incident.descripcion || "",
                    direccion: incident.direccion || "",
                    lat: incident.lat || 0,
                    lng: incident.lng || 0,

                    // Timestamp
                    createdAt: incident.creado_en?.toDate?.()?.toISOString() || incident.creado_en || "",
                    timestamp: incident.creado_en?.toDate?.()?.getTime() || Date.now(),
                };
            })
        );

        const table = (vectorStore as any).table;

        // Simplemente agregar los nuevos documentos (ya fueron limpiados)
        await table.add(documentsWithVectors);
        console.log(`✅ Se cargaron ${documentsWithVectors.length} incidentes nuevos sin duplicados`);
    } catch (e) {
        console.error("Error al cargar incidentes en LanceDB:", e);
        throw e;
    }
}

// EXPORTAR FUNCIÓN DE SINCRONIZACIÓN
export async function syncIncidentsToVectorStore(): Promise<{ success: boolean; count: number; message: string }> {
    if (syncInProgress) {
        return { success: false, count: 0, message: "⏳ Sincronización ya en progreso" };
    }

    syncInProgress = true;
    try {
        console.log("🔄 Iniciando sincronización de incidentes...");

        const incidents = await fetchIncidentsFromFirestore();
        await clearOldIncidents();
        await loadIncidentsToVectorStore(incidents);

        return { success: true, count: incidents.length, message: `✅ Se sincronizaron ${incidents.length} incidentes` };
    } catch (e: any) {
        console.error("❌ Error en sincronización:", e);
        return { success: false, count: 0, message: `❌ Error: ${e.message}` };
    } finally {
        syncInProgress = false;
    }
}

// ✅ AGREGAR UN INCIDENTE INDIVIDUAL A LANCEDB
export async function addIncidentToVectorStore(document: {
    id: string;
    text: string;
    vector: number[];
    tipo: string;
    gravedad: string;
    estado: string;
    nombre_paciente: string;
    edad_aproximada: number;
    descripcion: string;
    direccion: string;
    lat: number;
    lng: number;
    timestamp: number;
}): Promise<void> {
    try {
        const connection = await connect(dbPath);
        const table = await connection.openTable("incidentes_vectors");

        // Agregar un documento
        await table.add([document]);
        console.log(`✅ Incidente ${document.id} agregado a LanceDB`);
    } catch (e) {
        console.error("Error al agregar incidente a LanceDB:", e);
        throw e;
    }
}

async function initializeVectorStore() {
    try {
        const connection = await connect(dbPath);
        const tableNames = await connection.tableNames();

        let table;

        // Si la tabla existe, eliminarla para recrearla con el nuevo schema
        if (tableNames.includes("incidentes_vectors")) {
            console.log("🔄 Eliminando tabla antigua para recrearla con nuevo schema...");
            await connection.dropTable("incidentes_vectors");
        }

        // Crear tabla con el schema completo (Voyage AI = 1024 dims)
        table = await connection.createTable("incidentes_vectors", [
            {
                vector: Array(1024).fill(0),
                text: "init",
                id: "0",
                tipo: "init",
                gravedad: "init",
                estado: "init",
                nombre_paciente: "init",
                edad_aproximada: 0,
                descripcion: "init",
                direccion: "init",
                lat: 0,
                lng: 0,
                createdAt: "",
                timestamp: Date.now(),
            }
        ]);

        vectorStore = new LanceDB(embeddings, { table });
        console.log("✅ LanceDB inicializado con schema completo");

        // 🔥 SINCRONIZAR EN LA PRIMERA CARGA
        if (typeof window === 'undefined') {
            console.log("🔄 Primera sincronización (esperando a que se complete)...");
            await syncIncidentsToVectorStore();
        }
    } catch (e) {
        console.error("Error al inicializar LanceDB:", e);
        throw e;
    }
}

export async function getVectorStore(): Promise<LanceDB> {
    if (!vectorStore) {
        await initializeVectorStore();
    }
    return vectorStore;
}

export async function getRetriever(similarityThreshold: number = 0.4) {
    const store = await getVectorStore();
    return store.asRetriever({
        k: 10
    });
}

/**
 * Inicializar tabla de documentos (schema simple: id, text, vector)
 */
async function initializeDocumentsStore() {
    try {
        const connection = await connect(dbPath);
        const tableNames = await connection.tableNames();

        // Si la tabla existe, eliminarla para recrearla
        if (tableNames.includes("documentos_vectors")) {
            console.log("🔄 Recreando tabla de documentos...");
            await connection.dropTable("documentos_vectors");
        }

        // Crear tabla con schema simple: solo id, text, vector (Voyage AI = 1024 dims)
        const table = await connection.createTable("documentos_vectors", [
            {
                vector: Array(1024).fill(0),
                text: "init",
                id: "0",
            }
        ]);

        documentsTable = table;
        documentsStore = new LanceDB(embeddings, { table });
        console.log("✅ Tabla de documentos inicializada");
    } catch (e) {
        console.error("Error al inicializar tabla de documentos:", e);
        throw e;
    }
}

/**
 * Obtener tienda de documentos
 */
export async function getDocumentsStore(): Promise<LanceDB> {
    if (!documentsStore) {
        await initializeDocumentsStore();
    }
    return documentsStore;
}

/**
 * Agregar documentos a la tabla (sin metadatos)
 */
export async function addDocumentsToVectorStore(
    documents: Array<{ id: string; text: string; vector: number[] }>
): Promise<void> {
    try {
        if (!documentsTable) {
            await initializeDocumentsStore();
        }

        console.log(`📝 Agregando ${documents.length} documentos a LanceDB...`);
        await documentsTable.add(documents);
        console.log(`✅ ${documents.length} documentos agregados exitosamente`);
    } catch (e) {
        console.error("Error al agregar documentos:", e);
        throw e;
    }
}

/**
 * Buscar solo en documentos
 */
export async function searchDocuments(
    query: string,
    similarityThreshold: number = 0.4
): Promise<any[]> {
    try {
        console.log(`🔍 Búsqueda en documentos: "${query}" (umbral: ${(similarityThreshold * 100).toFixed(0)}%)`);

        const store = await getDocumentsStore();
        const retriever = store.asRetriever({ k: 10 });
        const results = await retriever.invoke(query);

        const formattedResults = results
            .map((doc: any) => {
                const distance = doc.metadata?._distance ?? 1;
                const similarity = 1 - distance;

                return {
                    id: doc.metadata?.id || "sin-id",
                    content: doc.pageContent,
                    metadata: {
                        source: "document",
                    },
                    distance: parseFloat(distance.toFixed(4)),
                    similarity: similarity,
                    relevanceScore: `${(similarity * 100).toFixed(1)}%`
                };
            })
            .filter(result => result.similarity >= similarityThreshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 10);

        console.log(`✅ ${formattedResults.length} documentos encontrados`);

        return formattedResults;
    } catch (e) {
        console.error("❌ Error en búsqueda de documentos:", e);
        return [];
    }
}

// Agregar esta función de exportación al final de vector-store.ts

export interface SearchFilters {
    estado?: string;
    prioridad?: string;
    tipo_emergencia?: string;
    edad_min?: number;
    edad_max?: number;
    descripcion?: string;
    nombre_paciente?: string;
    fechaInicio?: Date;
    fechaFin?: Date;
    // Filtro geoespacial (opcional)
    latitud?: number;
    longitud?: number;
    radiusKm?: number;
}

/**
 * Calcula distancia en km entre dos coordenadas (Haversine formula)
 */
function getDistanceFromLatLonInKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radio de la tierra en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export async function searchKnowledge(
    query: string,
    similarityThreshold: number = 0.4
): Promise<any[]> {
    try {
        console.log(`🔍 Búsqueda: "${query}" (umbral: ${(similarityThreshold * 100).toFixed(0)}%)`);

        const retriever = await getRetriever(similarityThreshold);
        const results = await retriever.invoke(query);

        const formattedResults = results
            .map((doc: any) => {
                const distance = doc.metadata?._distance ?? 1;
                const similarity = 1 - distance;

                return {
                    id: doc.metadata?.id || "sin-id",
                    content: doc.pageContent,
                    metadata: {
                        tipo: doc.metadata?.tipo,
                        gravedad: doc.metadata?.gravedad,
                        estado: doc.metadata?.estado,
                        nombre_paciente: doc.metadata?.nombre_paciente,
                        edad_aproximada: doc.metadata?.edad_aproximada,
                        descripcion: doc.metadata?.descripcion,
                        direccion: doc.metadata?.direccion,
                        lat: doc.metadata?.lat,
                        lng: doc.metadata?.lng,
                        createdAt: doc.metadata?.createdAt,
                    },
                    distance: parseFloat(distance.toFixed(4)),
                    similarity: similarity,
                    relevanceScore: `${(similarity * 100).toFixed(1)}%`
                };
            })
            .filter(result => result.similarity >= similarityThreshold)
            .sort((a, b) => b.similarity - a.similarity)
            .slice(0, 5);

        console.log(`✅ ${formattedResults.length} resultados encontrados`);

        return formattedResults;
    } catch (e) {
        console.error("❌ Error en búsqueda:", e);
        return [];
    }
}

/**
 * Búsqueda semántica con filtros avanzados
 */
export async function searchKnowledgeWithFilters(
    query: string,
    filters?: SearchFilters,
    similarityThreshold: number = 0.2
): Promise<any[]> {
    try {
        console.log(`🔍 Búsqueda: "${query}" con similitud >= ${(similarityThreshold * 100).toFixed(0)}%`);

        const retriever = await getRetriever(similarityThreshold);
        const results = await retriever.invoke(query);

        console.log(`📊 Raw results from LanceDB: ${results.length}`);

        // 🔍 DEBUG: Ver la estructura del primer resultado
        if (results.length > 0) {
            console.log(`🔍 DEBUG - Primer resultado (keys):`, Object.keys(results[0]));
            console.log(`🔍 DEBUG - Metadata (keys):`, Object.keys(results[0].metadata || {}));
            console.log(`🔍 DEBUG - _distance exists:`, results[0].metadata?._distance);
            console.log(`🔍 DEBUG - Score exists:`, results[0].metadata?.score);
            console.log(`🔍 DEBUG - Metadata completo:`, JSON.stringify(results[0].metadata, null, 2));
            console.log(`🔍 DEBUG - pageContent:`, results[0].pageContent?.substring(0, 100));
        }

        // Mapear y filtrar por similitud
        let formattedResults = results
            .map((doc: any, idx: number) => {
                const distance = doc.metadata?._distance ?? doc.metadata?.score ?? 1;
                const similarity = 1 / (1 + distance);

                // 🔍 DEBUG: Log de cada similarity (primeros 5)
                if (idx < 5) {
                    console.log(`🔍 DEBUG [${idx}] - distance: ${distance}, similarity: ${similarity}, relevanceScore: ${(similarity * 100).toFixed(1)}%`);
                }

                return {
                    id: doc.metadata?.id || "sin-id",
                    content: doc.pageContent,
                    metadata: {
                        tipo: doc.metadata?.tipo,
                        gravedad: doc.metadata?.gravedad,
                        estado: doc.metadata?.estado,
                        nombre_paciente: doc.metadata?.nombre_paciente,
                        edad_aproximada: doc.metadata?.edad_aproximada,
                        descripcion: doc.metadata?.descripcion,
                        direccion: doc.metadata?.direccion,
                        lat: doc.metadata?.lat,
                        lng: doc.metadata?.lng,
                        createdAt: doc.metadata?.createdAt,
                    },
                    distance: parseFloat(distance.toFixed(4)),
                    similarity: similarity,
                    relevanceScore: `${(similarity * 100).toFixed(1)}%`
                };
            })
            .filter(result => result.similarity >= similarityThreshold)
            .sort((a, b) => b.similarity - a.similarity);

        console.log(`✅ Después de umbral: ${formattedResults.length} resultados`);

        // SOLO aplicar filtros de negocio si existen
        if (filters) {
            console.log(`🔍 Aplicando filtros de negocio:`, filters);

            formattedResults = formattedResults.filter(result => {
                const meta = result.metadata;

                if (filters.estado && meta.estado !== filters.estado) {
                    return false;
                }

                if (filters.prioridad && meta.gravedad !== filters.prioridad) {
                    return false;
                }

                if (filters.tipo_emergencia && meta.tipo !== filters.tipo_emergencia) {
                    return false;
                }

                if (filters.edad_min !== undefined && meta.edad_aproximada < filters.edad_min) {
                    return false;
                }
                if (filters.edad_max !== undefined && meta.edad_aproximada > filters.edad_max) {
                    return false;
                }

                if (filters.nombre_paciente) {
                    const nombreLower = meta.nombre_paciente?.toLowerCase() || "";
                    const filterLower = filters.nombre_paciente.toLowerCase();
                    if (!nombreLower.includes(filterLower)) {
                        return false;
                    }
                }

                if (filters.descripcion) {
                    const descLower = meta.descripcion?.toLowerCase() || "";
                    const filterLower = filters.descripcion.toLowerCase();
                    if (!descLower.includes(filterLower)) {
                        return false;
                    }
                }

                if (filters.fechaInicio || filters.fechaFin) {
                    const docDate = new Date(meta.createdAt);
                    if (filters.fechaInicio && docDate < filters.fechaInicio) {
                        return false;
                    }
                    if (filters.fechaFin && docDate > filters.fechaFin) {
                        return false;
                    }
                }

                if (filters.latitud !== undefined && filters.longitud !== undefined && filters.radiusKm) {
                    const distanceKm = getDistanceFromLatLonInKm(
                        filters.latitud,
                        filters.longitud,
                        meta.lat || 0,
                        meta.lng || 0
                    );
                    if (distanceKm > filters.radiusKm) {
                        return false;
                    }
                }

                return true;
            });

            console.log(`✅ Después de filtros de negocio: ${formattedResults.length} resultados`);
        }

        // Limitar a top 5
        formattedResults = formattedResults.slice(0, 5);

        console.log(`✅ Resultado final: ${formattedResults.length} documentos`);

        return formattedResults;
    } catch (e) {
        console.error("❌ Error en búsqueda con filtros:", e);
        return [];
    }
}

/**
 * Obtener distancia geoespacial entre dos coordenadas (fórmula de Haversine)
 */
