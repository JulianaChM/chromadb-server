
import { connect } from '@lancedb/lancedb';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * Script para listar los registros actuales en la tabla de vectores de LanceDB.
 * Ejecutar con: npm run vectors:list
 */
async function listVectors() {
  const dbPath = process.env.LANCEDB_PATH || "lancedb.db";
  console.log(`🔍 Conectando a LanceDB en: ${dbPath}...`);

  try {
    const dbConnection = await connect(dbPath);
    const tableNames = await dbConnection.tableNames();

    console.log('📋 Tablas detectadas:', tableNames);

    if (!tableNames.includes('incidentes_vectors')) {
      console.log('\n❌ No se encontró la tabla "incidentes_vectors".');
      console.log('💡 Para crearla, inicia la aplicación (npm run dev) y navega a la página principal');
      console.log('   esto disparará el proceso initializeApp() en src/app/layout.tsx.');
      return;
    }

    const table = await dbConnection.openTable('incidentes_vectors');
    const count = await table.countRows();
    console.log(`\n📈 Total de registros en la tabla: ${count}`);

    // Obtenemos los registros (limitado a 50 para la consola)
    const results = await table.query().limit(50).toArray();

    if (results.length === 0) {
      console.log('⚠️ La tabla existe pero está vacía.');
    } else {
      console.log(`\n✅ Mostrando primeros ${results.length} registros:`);
      results.forEach((row, i) => {
        // En LanceDB 1.x con LangChain, el texto suele estar en la columna 'text'
        console.log(`\n[${i + 1}] ID: ${row.id}`);
        console.log(`    Contenido: ${row.text?.substring(0, 150)}...`);
        // La metadata puede venir como string JSON o como objeto dependiendo de la inserción
        const meta = typeof row.metadata === 'string' ? JSON.parse(row.metadata) : row.metadata;
        console.log(`    Metadata:`, meta);
      });
    }
  } catch (error) {
    console.error('\n❌ Error al intentar listar los vectores:', error);
  }
}

listVectors();
