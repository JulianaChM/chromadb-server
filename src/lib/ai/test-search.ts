import { searchKnowledge } from "./vector-store";

async function testSemanticSearch() {
    console.log("🧪 Iniciando prueba de búsqueda semántica...\n");
    
    const queries = [
        "accidentes de tránsito graves",
        "paciente con problemas respiratorios",
        "trauma torácico severo"
    ];
    
    for (const query of queries) {
        console.log(`\n📌 Query: "${query}"`);
        console.log("---");
        
        const results = await searchKnowledge(query);
        
        console.log(results);
        console.log("\n");
    }
}

testSemanticSearch().catch(console.error);