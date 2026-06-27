/**
 * fix-indexes.js — Run ONCE to drop all duplicate/extra indexes on the users table
 * Usage: node fix-indexes.js
 */
const sequelize = require('./config/database');

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Connected to database.');

    // Get all indexes on users table
    const [indexes] = await sequelize.query(
      `SELECT INDEX_NAME, COLUMN_NAME, NON_UNIQUE 
       FROM INFORMATION_SCHEMA.STATISTICS 
       WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'
       ORDER BY INDEX_NAME`
    );

    console.log('\n📋 Current indexes on `users` table:');
    indexes.forEach(i => console.log(`  - ${i.INDEX_NAME} on (${i.COLUMN_NAME}), unique=${!i.NON_UNIQUE}`));

    // Keep only these indexes (drop everything else except PRIMARY)
    const keepIndexes = new Set([
      'PRIMARY',
      'users_gym_id_unique',
      'users_email_unique',
      'users_phone_unique',
      'users_device_fingerprint_unique',
      'users_referral_code_unique',
    ]);

    const toDrop = indexes
      .map(i => i.INDEX_NAME)
      .filter((name, idx, arr) => arr.indexOf(name) === idx) // unique names
      .filter(name => !keepIndexes.has(name));

    if (toDrop.length === 0) {
      console.log('\n✅ No extra indexes to drop. Table is clean!');
    } else {
      console.log(`\n🗑️  Dropping ${toDrop.length} extra index(es)...`);
      for (const name of toDrop) {
        try {
          await sequelize.query(`ALTER TABLE \`users\` DROP INDEX \`${name}\``);
          console.log(`  ✅ Dropped: ${name}`);
        } catch (e) {
          console.log(`  ⚠️  Could not drop ${name}: ${e.message}`);
        }
      }
    }

    // Now re-check
    const [after] = await sequelize.query(
      `SELECT COUNT(DISTINCT INDEX_NAME) as cnt FROM INFORMATION_SCHEMA.STATISTICS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users'`
    );
    console.log(`\n✅ Done. users table now has ${after[0].cnt} index(es).`);

    process.exit(0);
  } catch (e) {
    console.error('❌ Error:', e.message);
    process.exit(1);
  }
};

run();
