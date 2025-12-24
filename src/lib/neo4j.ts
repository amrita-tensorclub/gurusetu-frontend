import neo4j from 'neo4j-driver';

const URI = process.env.NEO4J_URI as string;
const USER = process.env.NEO4J_USER as string;
const PASSWORD = process.env.NEO4J_PASSWORD as string;

if (!URI || !USER || !PASSWORD) {
  throw new Error('Missing Neo4j environment variables. Check .env.local');
}

// 1. Create Driver without manual encryption config
// The URI (neo4j+s://) already handles security settings for AuraDB.
export const driver = neo4j.driver(
  URI, 
  neo4j.auth.basic(USER, PASSWORD),
  { 
    disableLosslessIntegers: true // keeps numbers simple for JavaScript
  }
);

// 2. Connection Helper
export async function checkConnection() {
  const session = driver.session();
  try {
    await session.run('RETURN 1');
    console.log('✅ Connected to Neo4j');
  } catch (error) {
    console.error('❌ Neo4j Connection Failed:', error);
  } finally {
    await session.close();
  }
}