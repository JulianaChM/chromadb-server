'use server';

import { getVectorStore } from "./vector-store";
import { embeddings } from "./models";

export async function diagnoseRetrieval() {
    console.log("\n" + "=".repeat(80));
    console.log("🔍 DIAGNÓSTICO COMPLETO DEL RETRIEVAL VECTORIAL");
    console.log("=".repeat(80) + "\n");

    try {
        // PASO 1: INSPECCIONAR DOCUMENTOS ALMACENADOS
        console.log("📊 PASO 1: INSPECCIONAR DOCUMENTOS EN LANCEDB");
        console.log("-".repeat(80));
        
        const store = await getVectorStore();
        const table = (store as any).table;
        
        // Obtener todos los documentos
        const allDocs = await table.query().limit(100).toArray();
        
        console.log(`✅ Total de registros en LanceDB: ${allDocs.length}\n`);
        
        // Mostrar estructura del primer registro
        if (allDocs.length > 0) {
            const firstDoc = allDocs[0];
            console.log("📝 Estructura del primer registro:");
            console.log(`  ID: ${firstDoc.id}`);
            console.log(`  Tipo: ${firstDoc.tipo}`);
            console.log(`  Gravedad: ${firstDoc.gravedad}`);
            console.log(`  Estado: ${firstDoc.estado}`);
            console.log(`  Nombre Paciente: ${firstDoc.nombre_paciente}`);
            console.log(`  Edad: ${firstDoc.edad_aproximada}`);
            console.log(`  Descripción: ${firstDoc.descripcion?.substring(0, 100)}`);
            console.log(`  Dirección: ${firstDoc.direccion?.substring(0, 100)}`);
            console.log(`  Vector dimension: ${firstDoc.vector?.length || 'N/A'}`);
            console.log(`  Timestamp: ${firstDoc.timestamp}`);
            console.log(`  CreatedAt: ${firstDoc.createdAt}\n`);
        }

        // PASO 2: VERIFICAR TEXTO INDEXADO
        console.log("📝 PASO 2: TEXTO UTILIZADO PARA EMBEDDINGS");
        console.log("-".repeat(80));
        
        allDocs.slice(0, 3).forEach((doc, idx) => {
            console.log(`\n[Documento ${idx + 1}]`);
            console.log(`ID: ${doc.id}`);
            console.log(`Tipo: ${doc.tipo}`);
            console.log(`Gravedad: ${doc.gravedad}`);
            console.log(`Estado: ${doc.estado}`);
            console.log(`Descripción: ${doc.descripcion}`);
            console.log(`Dirección: ${doc.direccion}`);
            console.log(`\nTexto indexado:\n${doc.text}\n`);
        });

        // PASO 3: PRUEBAS DE RETRIEVAL PURO (SIN FILTROS)
        console.log("\n📊 PASO 3: RETRIEVAL PURO (SIN FILTROS)");
        console.log("-".repeat(80));
        
        const testQueries = [
            "accidente de moto",
            "paciente inconsciente",
            "emergencias cardiacas",
            "casos graves",
            "adulto mayor"
        ];

        for (const query of testQueries) {
            console.log(`\n🔍 Consulta: "${query}"`);
            console.log("-".repeat(40));

            // Generar embedding
            const queryEmbedding = await embeddings.embedQuery(query);
            console.log(`✅ Embedding generado. Dimensión: ${queryEmbedding.length}`);

            // Búsqueda pura en LanceDB
            try {
                const searchResults = await table
                    .search(queryEmbedding)
                    .limit(10)
                    .toArray();

                console.log(`📊 Resultados encontrados: ${searchResults.length}\n`);

                searchResults.forEach((result, idx) => {
                    const distance = result._distance;
                    const similarity = 1 - distance;
                    
                    console.log(`[${idx + 1}]`);
                    console.log(`  ID: ${result.id}`);
                    console.log(`  Tipo: ${result.tipo}`);
                    console.log(`  Gravedad: ${result.gravedad}`);
                    console.log(`  Estado: ${result.estado}`);
                    console.log(`  Distance (LanceDB): ${distance.toFixed(4)}`);
                    console.log(`  Similitud (1 - dist): ${(similarity).toFixed(4)} (${(similarity * 100).toFixed(1)}%)`);
                    console.log(`  Contenido: ${result.text.substring(0, 150)}...`);
                    console.log();
                });
            } catch (e) {
                console.error(`❌ Error en búsqueda: ${e}`);
            }
        }

        // PASO 4: ANALIZAR MÉTRICA DE SIMILITUD
        console.log("\n📊 PASO 4: ANÁLISIS DE MÉTRICA DE SIMILITUD");
        console.log("-".repeat(80));
        
        const testQuery = "accidente de moto";
        const testEmbedding = await embeddings.embedQuery(testQuery);
        const rawResults = await table.search(testEmbedding).limit(5).toArray();

        console.log(`Consulta de prueba: "${testQuery}"`);
        console.log("\nDistancias reportadas por LanceDB:");
        rawResults.forEach((result, idx) => {
            const dist = result._distance;
            console.log(`  [${idx + 1}] Distance: ${dist.toFixed(6)} → Similitud (1-dist): ${(1-dist).toFixed(4)}`);
        });

        console.log("\n✅ Interpretación:");
        console.log("  - Distance cerca de 0 = muy similar");
        console.log("  - Distance cerca de 1 = muy diferente");
        console.log("  - Similitud = 1 - distance (rango 0-1)");

        // PASO 5: REVISAR CONFIGURACIÓN
        console.log("\n📊 PASO 5: CONFIGURACIÓN DEL VECTOR STORE");
        console.log("-".repeat(80));
        
        console.log(`Tipo de índice: LanceDB`);
        console.log(`Modelo de embeddings: Gemini embedding-001`);
        console.log(`Dimensión de vectores: 3072`);
        console.log(`Métrica: Euclidean distance (por defecto en LanceDB)`);
        console.log(`k (límite de resultados): 15 en getRetriever()`);

        // PASO 6: VERIFICAR CONTENIDO DE DESCRIPCIÓN
        console.log("\n📊 PASO 6: BÚSQUEDA DE KEYWORDS EN DESCRIPCIÓN");
        console.log("-".repeat(80));
        
        const motoRelated = allDocs.filter(doc => 
            doc.descripcion?.toLowerCase().includes("moto") ||
            doc.text?.toLowerCase().includes("moto")
        );
        
        console.log(`Documentos con "moto": ${motoRelated.length}`);
        motoRelated.forEach(doc => {
            console.log(`  - ID: ${doc.id}, Desc: ${doc.descripcion?.substring(0, 80)}`);
        });

    } catch (error) {
        console.error("❌ Error en diagnóstico:", error);
    }

    console.log("\n" + "=".repeat(80));
    console.log("✅ DIAGNÓSTICO COMPLETADO");
    console.log("=".repeat(80) + "\n");
}