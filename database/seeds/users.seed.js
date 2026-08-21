/* eslint-disable @typescript-eslint/no-require-imports */
const { readFileSync } = require('node:fs');
const { resolve } = require('node:path');
const { Pool } = require('pg');
const { hash } = require('bcrypt');

const defaultPassword = 'Password123!';

const users = [
  [
    'alex.rivera',
    'alex.rivera@example.com',
    24,
    'Backend learner focused on NestJS APIs.',
  ],
  [
    'maria.chen',
    'maria.chen@example.com',
    29,
    'Frontend developer exploring full-stack projects.',
  ],
  [
    'david.kim',
    'david.kim@example.com',
    31,
    'Database enthusiast and SQL practice user.',
  ],
  [
    'sara.patel',
    'sara.patel@example.com',
    27,
    'Product-minded engineer building CRUD apps.',
  ],
  [
    'ivan.petrov',
    'ivan.petrov@example.com',
    35,
    'Node.js developer working with PostgreSQL.',
  ],
  [
    'lina.smith',
    'lina.smith@example.com',
    22,
    'Junior developer learning authentication flows.',
  ],
  [
    'omar.hassan',
    'omar.hassan@example.com',
    28,
    'API tester and backend student.',
  ],
  [
    'emma.wilson',
    'emma.wilson@example.com',
    26,
    'TypeScript user practicing service patterns.',
  ],
  [
    'noah.brown',
    'noah.brown@example.com',
    33,
    'Software engineer interested in clean modules.',
  ],
  [
    'anna.miller',
    'anna.miller@example.com',
    30,
    'NestJS learner building homework features.',
  ],
  [
    'leo.garcia',
    'leo.garcia@example.com',
    25,
    'Developer practicing JWT guards.',
  ],
  [
    'sofia.martin',
    'sofia.martin@example.com',
    32,
    'Engineer improving database migrations.',
  ],
  [
    'max.roberts',
    'max.roberts@example.com',
    23,
    'Student learning repository patterns.',
  ],
  [
    'nina.lee',
    'nina.lee@example.com',
    34,
    'Backend developer focused on validation.',
  ],
  [
    'adam.scott',
    'adam.scott@example.com',
    27,
    'JavaScript developer moving into NestJS.',
  ],
  [
    'elena.morozova',
    'elena.morozova@example.com',
    29,
    'Full-stack developer testing seeded data.',
  ],
  [
    'tim.johnson',
    'tim.johnson@example.com',
    36,
    'Engineer interested in auth and security.',
  ],
  [
    'kate.anderson',
    'kate.anderson@example.com',
    21,
    'New developer practicing REST endpoints.',
  ],
  [
    'amir.khan',
    'amir.khan@example.com',
    38,
    'Backend mentor reviewing API structure.',
  ],
  [
    'olga.sokolova',
    'olga.sokolova@example.com',
    28,
    'Developer learning PostgreSQL constraints.',
  ],
  [
    'ben.thomas',
    'ben.thomas@example.com',
    24,
    'TypeScript learner using seeded users.',
  ],
  [
    'yuki.tanaka',
    'yuki.tanaka@example.com',
    31,
    'Engineer experimenting with services.',
  ],
  [
    'mila.popova',
    'mila.popova@example.com',
    26,
    'Student building auth homework.',
  ],
  [
    'daniel.evans',
    'daniel.evans@example.com',
    37,
    'API consumer testing pagination later.',
  ],
  [
    'irina.volkova',
    'irina.volkova@example.com',
    30,
    'Developer exploring module boundaries.',
  ],
  [
    'chris.white',
    'chris.white@example.com',
    25,
    'Backend beginner practicing controllers.',
  ],
  [
    'amina.ali',
    'amina.ali@example.com',
    33,
    'Engineer testing protected routes.',
  ],
  [
    'pavel.novak',
    'pavel.novak@example.com',
    39,
    'Developer using local Postgres data.',
  ],
  [
    'julia.moore',
    'julia.moore@example.com',
    27,
    'NestJS student testing login flows.',
  ],
  [
    'sam.green',
    'sam.green@example.com',
    22,
    'Learner working through database seeds.',
  ],
];

function loadEnv() {
  const envPath = resolve(process.cwd(), '.env');
  const envFile = readFileSync(envPath, 'utf8');

  for (const line of envFile.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');

    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex);
    const value = trimmed.slice(separatorIndex + 1);

    process.env[key] ??= value;
  }
}

function getConnectionString() {
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  const host = process.env.DB_HOST ?? 'localhost';
  const port = process.env.DB_PORT ?? '5432';
  const database = process.env.DB_NAME ?? 'legion-homework';
  const user = process.env.DB_USER ?? 'postgres';
  const password = process.env.DB_PASSWORD ?? 'postgres';

  return `postgres://${user}:${password}@${host}:${port}/${database}`;
}

async function seedUsers() {
  loadEnv();

  const pool = new Pool({
    connectionString: getConnectionString(),
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await hash(defaultPassword, 10);
    let insertedCount = 0;

    for (const [login, email, age, about] of users) {
      const result = await client.query(
        `
          INSERT INTO users (login, email, password, age, about)
          VALUES ($1, $2, $3, $4, $5)
          ON CONFLICT (email) DO NOTHING
          RETURNING id
        `,
        [login, email, passwordHash, age, about],
      );

      insertedCount += result.rowCount ?? 0;
    }

    await client.query('COMMIT');

    console.log(`Seeded ${insertedCount} users.`);
    console.log(`Default password for seeded users: ${defaultPassword}`);
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seedUsers().catch((error) => {
  console.error('User seeding failed.');
  console.error(error);
  process.exitCode = 1;
});
