// scripts/setup-indexes.js
/**
 * Script para criar todos os índices necessários no MongoDB
 * Execute com: node scripts/setup-indexes.js
 */

import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

async function createIndexes() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Conectado ao MongoDB');

    const db = client.db(dbName);

    // ==================== USERS ====================
    console.log('\n📁 Criando índices para users...');
    
    await db.collection('users').createIndexes([
      {
        key: { email: 1 },
        unique: true,
        name: 'email_unique'
      },
      {
        key: { id: 1 },
        unique: true,
        name: 'id_unique'
      },
      {
        key: { plan: 1 },
        name: 'plan_index'
      },
      {
        key: { created_at: -1 },
        name: 'created_at_desc'
      },
      {
        key: { mercadopagoPaymentId: 1 },
        name: 'mercadopago_payment_index',
        sparse: true // Apenas para usuários com pagamento
      },
      {
        key: { followers: 1 },
        name: 'followers_index'
      },
      {
        key: { following: 1 },
        name: 'following_index'
      }
    ]);

    console.log('✅ Índices de users criados');

    // ==================== STUDY_PLANS ====================
    console.log('\n📁 Criando índices para study_plans...');
    
    await db.collection('study_plans').createIndexes([
      {
        key: { id: 1 },
        unique: true,
        name: 'id_unique'
      },
      {
        key: { user_id: 1, created_at: -1 },
        name: 'user_created_index'
      },
      {
        key: { user_id: 1, updated_at: -1 },
        name: 'user_updated_index'
      },
      {
        key: { groupIds: 1 },
        name: 'group_ids_index',
        sparse: true
      },
      {
        key: { subject: 'text' },
        name: 'subject_text_search'
      },
      {
        key: { 'lessons.id': 1 },
        name: 'lessons_id_index'
      }
    ]);

    console.log('✅ Índices de study_plans criados');

    // ==================== GROUPS ====================
    console.log('\n📁 Criando índices para groups...');
    
    await db.collection('groups').createIndexes([
      {
        key: { id: 1 },
        unique: true,
        name: 'id_unique'
      },
      {
        key: { members: 1 },
        name: 'members_index'
      },
      {
        key: { creator_id: 1 },
        name: 'creator_index'
      },
      {
        key: { subject: 1 },
        name: 'subject_index'
      },
      {
        key: { isPrivate: 1 },
        name: 'privacy_index'
      },
      {
        key: { created_at: -1 },
        name: 'created_at_desc'
      },
      {
        key: { name: 'text', description: 'text', subject: 'text' },
        name: 'group_text_search'
      }
    ]);

    console.log('✅ Índices de groups criados');

    // ==================== RATE_LIMITS ====================
    console.log('\n📁 Criando índices para rate_limits...');
    
    await db.collection('rate_limits').createIndexes([
      {
        key: { key: 1 },
        unique: true,
        name: 'key_unique'
      },
      {
        key: { expiresAt: 1 },
        expireAfterSeconds: 0,
        name: 'ttl_index'
      }
    ]);

    console.log('✅ Índices de rate_limits criados');

    // ==================== TOKEN_BLACKLIST ====================
    console.log('\n📁 Criando índices para token_blacklist...');
    
    await db.collection('token_blacklist').createIndexes([
      {
        key: { token: 1 },
        unique: true,
        name: 'token_unique'
      },
      {
        key: { expiresAt: 1 },
        expireAfterSeconds: 0,
        name: 'ttl_index'
      }
    ]);

    console.log('✅ Índices de token_blacklist criados');

    // ==================== FAILED_LOGINS ====================
    console.log('\n📁 Criando índices para failed_logins...');
    
    await db.collection('failed_logins').createIndexes([
      {
        key: { email: 1, timestamp: -1 },
        name: 'email_timestamp_index'
      },
      {
        key: { ip: 1, timestamp: -1 },
        name: 'ip_timestamp_index'
      },
      {
        key: { timestamp: 1 },
        expireAfterSeconds: 2592000, // 30 dias
        name: 'ttl_index'
      }
    ]);

    console.log('✅ Índices de failed_logins criados');

    // ==================== VERIFICAR TODOS OS ÍNDICES ====================
    console.log('\n📊 Verificando todos os índices criados...\n');

    const collections = [
      'users',
      'study_plans',
      'groups',
      'rate_limits',
      'token_blacklist',
      'failed_logins'
    ];

    for (const collectionName of collections) {
      const indexes = await db.collection(collectionName).indexes();
      console.log(`📋 ${collectionName}:`);
      indexes.forEach(index => {
        console.log(`   - ${index.name}${index.unique ? ' (unique)' : ''}${index.expireAfterSeconds !== undefined ? ' (TTL)' : ''}`);
      });
    }

    console.log('\n✅ Todos os índices foram criados com sucesso!');

  } catch (error) {
    console.error('❌ Erro ao criar índices:', error);
    throw error;
  } finally {
    await client.close();
    console.log('\n🔒 Conexão fechada');
  }
}

// Executar
createIndexes()
  .then(() => {
    console.log('\n✨ Setup concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n💥 Setup falhou:', error);
    process.exit(1);
  });

// ==================== PACKAGE.JSON ====================
// Adicione ao package.json:
/*
{
  "scripts": {
    "setup:indexes": "node scripts/setup-indexes.js"
  },
  "type": "module"
}
*/
