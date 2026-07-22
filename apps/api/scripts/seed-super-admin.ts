import { Pool } from 'pg';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import * as dotenv from 'dotenv';

// Load environment variables
const rootDir = process.cwd();
dotenv.config({ path: `${rootDir}/apps/api/.env` });

async function seedSuperAdmin() {
  const configService = new ConfigService();
  const connectionString = configService.get<string>('DATABASE_URL');

  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pool = new Pool({ connectionString });

  try {
    const email = 'nxthxnael@gmail.com';
    const password = "_!1@3#4$DsA':(9)";
    const role = 'SUPER_ADMIN';

    // Hash password with bcrypt (10 rounds)
    const passwordHash = await bcrypt.hash(password, 10);

    // Check if super-admin already exists
    const existingUser = await pool.query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      console.log('Super-admin already exists, updating...');
      await pool.query(
        `UPDATE users 
         SET password_hash = $1, role = $2, approved_at = CURRENT_TIMESTAMP 
         WHERE email = $3`,
        [passwordHash, role, email]
      );
      console.log('Super-admin updated successfully');
    } else {
      // Insert super-admin
      await pool.query(
        `INSERT INTO users (email, password_hash, role, approved_at) 
         VALUES ($1, $2, $3, CURRENT_TIMESTAMP)`,
        [email, passwordHash, role]
      );
      console.log('Super-admin created successfully');
    }

    console.log(`Email: ${email}`);
    console.log(`Role: ${role}`);
  } catch (error) {
    console.error('Error seeding super-admin:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

seedSuperAdmin().catch(console.error);
