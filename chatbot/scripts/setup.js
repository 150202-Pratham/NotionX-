#!/usr/bin/env node

/**
 * Interactive Setup Script for ChatBot Integration
 * Run: npm run setup
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function setup() {
  console.log('\n🚀 ChatBot Integration Setup\n');

  try {
    // Check if .env.local exists
    const envPath = path.join(__dirname, '..', '.env.local');
    const envExamplePath = path.join(__dirname, '..', '.env.example');

    if (fs.existsSync(envPath)) {
      const overwrite = await question('.env.local already exists. Overwrite? (y/n): ');
      if (overwrite.toLowerCase() !== 'y') {
        console.log('Setup cancelled.');
        rl.close();
        return;
      }
    }

    // Gather configuration
    console.log('\n📋 Configuration Questions:\n');

    const config = {
      NODE_ENV: await question('Environment (production/development) [production]: ') || 'production',
      PORT: await question('ChatBot API Port [5000]: ') || '5000',
      OLLAMA_BASE_URL: await question('Ollama Base URL [http://localhost:11434]: ') || 'http://localhost:11434',
      OLLAMA_MODEL: await question('Ollama Model [qwen3:0.6b]: ') || 'qwen3:0.6b',
      DB_HOST: await question('PostgreSQL Host [localhost]: ') || 'localhost',
      DB_PORT: await question('PostgreSQL Port [5432]: ') || '5432',
      DB_NAME: await question('Database Name [aichatbot]: ') || 'aichatbot',
      DB_USER: await question('Database User [postgres]: ') || 'postgres',
      DB_PASSWORD: await question('Database Password [postgres]: ') || 'postgres',
      CORS_ORIGIN: await question('CORS Origins [http://localhost:3000]: ') || 'http://localhost:3000',
    };

    // Generate .env content
    const envContent = Object.entries(config)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');

    // Copy .env.example and append custom values
    let fullEnv = fs.readFileSync(envExamplePath, 'utf-8');
    
    // Update with custom values
    for (const [key, value] of Object.entries(config)) {
      fullEnv = fullEnv.replace(new RegExp(`${key}=.*`), `${key}=${value}`);
    }

    // Write .env.local
    fs.writeFileSync(envPath, fullEnv);
    console.log('\n✅ .env.local created successfully\n');

    // Test database connection
    console.log('\n🔍 Testing database connection...');
    try {
      const { Pool } = require('pg');
      const pool = new Pool({
        host: config.DB_HOST,
        port: parseInt(config.DB_PORT),
        database: config.DB_NAME,
        user: config.DB_USER,
        password: config.DB_PASSWORD,
      });

      const result = await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');
      await pool.end();
    } catch (error) {
      console.log('⚠️  Database connection failed. Make sure PostgreSQL is running.');
      console.log(`   Error: ${error.message}`);
    }

    // Summary
    console.log('\n✨ Setup Complete!\n');
    console.log('Next steps:');
    console.log('1. Run migrations: npm run migrate');
    console.log('2. Seed documents: npm run seed');
    console.log('3. Start server: npm start');
    console.log('4. Test endpoint: curl http://localhost:' + config.PORT + '/health\n');

  } catch (error) {
    console.error('Setup error:', error.message);
  } finally {
    rl.close();
  }
}

setup();
