const { sequelize } = require('../models');
const fs = require('fs');
const path = require('path');

const runMigrations = async () => {
  try {
    console.log('Starting database migrations...');

    // Authenticate database connection
    await sequelize.authenticate();
    console.log('Database connection established.');

    // Get all migration files
    const migrationFiles = fs.readdirSync(__dirname)
      .filter(file => file.endsWith('.js') && file !== 'migrate.js')
      .sort();

    console.log(`Found ${migrationFiles.length} migration files.`);

    // Run each migration
    for (const file of migrationFiles) {
      console.log(`Running migration: ${file}`);
      const migration = require(path.join(__dirname, file));
      
      if (migration.up) {
        await migration.up(sequelize.getQueryInterface(), sequelize.Sequelize);
        console.log(`✓ Migration ${file} completed successfully.`);
      } else {
        console.log(`⚠ Migration ${file} has no 'up' method, skipping.`);
      }
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
};

module.exports = { runMigrations };

// Run migrations if this file is executed directly
if (require.main === module) {
  runMigrations()
    .then(() => {
      console.log('Migration process completed.');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Migration process failed:', error);
      process.exit(1);
    });
}