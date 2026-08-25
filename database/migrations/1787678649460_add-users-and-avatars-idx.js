/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
exports.shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.up = (pgm) => {
  pgm.sql(`
    CREATE INDEX idx_avatars_active_user_created
    ON avatars (user_id, created_at DESC)
    WHERE deleted_at IS NULL;

    CREATE INDEX idx_users_age_with_about
    ON users (age)
    WHERE about IS NOT NULL;
  `);
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @param run {() => void | undefined}
 * @returns {Promise<void> | void}
 */
exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_avatars_active_user_created;

    DROP INDEX IF EXISTS idx_users_age_with_about;
  `);
};
