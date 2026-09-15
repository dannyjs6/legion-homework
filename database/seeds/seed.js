/**
 * @typedef {{ id: number }} UserIdRow
 */
import { Pool } from 'pg';
import { hash } from 'bcrypt';
import 'dotenv/config';

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
  ['david.kim', 'david.kim@example.com', 31, null],
  ['sara.patel', 'sara.patel@example.com', 27, null],
  ['ivan.petrov', 'ivan.petrov@example.com', 35, null],
  ['lina.smith', 'lina.smith@example.com', 22, null],
  ['omar.hassan', 'omar.hassan@example.com', 28, null],
  [
    'emma.wilson',
    'emma.wilson@example.com',
    26,
    'TypeScript user practicing service patterns.',
  ],
  ['noah.brown', 'noah.brown@example.com', 33, null],
  ['anna.miller', 'anna.miller@example.com', 30, null],
  ['leo.garcia', 'leo.garcia@example.com', 25, null],
  ['sofia.martin', 'sofia.martin@example.com', 32, null],
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
  ['adam.scott', 'adam.scott@example.com', 27, null],
  ['elena.morozova', 'elena.morozova@example.com', 29, null],
  ['tim.johnson', 'tim.johnson@example.com', 36, null],
  [
    'kate.anderson',
    'kate.anderson@example.com',
    21,
    'New developer practicing REST endpoints.',
  ],
  ['amir.khan', 'amir.khan@example.com', 38, null],
  ['olga.sokolova', 'olga.sokolova@example.com', 28, null],
  [
    'ben.thomas',
    'ben.thomas@example.com',
    24,
    'TypeScript learner using seeded users.',
  ],
  ['yuki.tanaka', 'yuki.tanaka@example.com', 31, null],
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
  ['irina.volkova', 'irina.volkova@example.com', 30, null],
  [
    'chris.white',
    'chris.white@example.com',
    25,
    'Backend beginner practicing controllers.',
  ],
  ['amina.ali', 'amina.ali@example.com', 33, null],
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
  ['sam.green', 'sam.green@example.com', 22, null],
];

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
  const pool = new Pool({
    connectionString: getConnectionString(),
  });

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const passwordHash = await hash(process.env.DEFAULT_PASSWORD, 10);

    // Give 15 random users a balance from 100 to 500.
    const usersWithBalance = users.map((user) => [...user, 0]);

    const randomIndexes = new Set();

    while (randomIndexes.size < 15) {
      randomIndexes.add(Math.floor(Math.random() * users.length));
    }

    for (const index of randomIndexes) {
      usersWithBalance[index][4] = Math.floor(Math.random() * 401) + 100;
    }

    const values = [];

    const placeholders = usersWithBalance.map(
      ([login, email, age, about, balance], index) => {
        const offset = index * 6;

        values.push(login, email, passwordHash, age, about, balance);

        return `(
          $${offset + 1},
          $${offset + 2},
          $${offset + 3},
          $${offset + 4},
          $${offset + 5},
          $${offset + 6}
        )`;
      },
    );

    const result = await client.query(
      `
        INSERT INTO users (
          login,
          email,
          password,
          age,
          about,
          balance
        )
        VALUES ${placeholders.join(', ')}
        ON CONFLICT (email) DO NOTHING
        RETURNING id
      `,
      values,
    );

    /** @type {import('pg').QueryResult<UserIdRow>} */
    const randomUsersResult = await client.query(`
      SELECT id
      FROM users
      ORDER BY RANDOM()
      LIMIT 10
    `);

    const randomUserIds = randomUsersResult.rows.map((row) => row.id);

    // 2 avatars for each selected user
    const avatarValues = [];

    const avatarPlaceholders = randomUserIds.flatMap((userId, index) => {
      const offset = index * 4;

      avatarValues.push(userId, 'avatars/sample.png');
      avatarValues.push(userId, 'avatars/sample.jpg');

      return [
        `($${offset + 1}, $${offset + 2})`,
        `($${offset + 3}, $${offset + 4})`,
      ];
    });

    await client.query(
      `
        INSERT INTO avatars (user_id, file_name)
        VALUES ${avatarPlaceholders.join(', ')}
      `,
      avatarValues,
    );

    await client.query('COMMIT');

    console.log(`Seeded ${result.rowCount ?? 0} users.`);
    console.log(`Seeded avatars for ${randomUserIds.length} users.`);
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
