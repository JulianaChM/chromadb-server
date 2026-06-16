
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
    const db = await connect(dbPath);
    const tableNames = await db.tableNames();

    if (!tableNames.includes('incidentes_vectors')) {
      console.log('❌ No se encontró la tabla "incidentes_vectors". Asegúrate de haber iniciado el bootstrap.');
      return;
    }

    const table = await db.openTable('incidentes_vectors');
    // Obtenemos los registros (limitado a 50 para la consola)
    const results = await table.query().limit(50).toArray();

    if (results.length === 0) {
      console.log('⚠️ La tabla está vacía.');
    } else {
      console.log(`✅ Se encontraron ${results.length} registros en la tabla "incidentes_vectors":`);
      results.forEach((row, i) => {
        console.log(`\n[${i + 1}] ID: ${row.id}`);
        console.log(`    Contenido: ${row.text?.substring(0, 150)}...`);
        console.log(`    Metadata:`, row.metadata);
      });
    }
  } catch (error) {
    console.error('❌ Error al listar vectores:', error);
  }
}

listVectors();
