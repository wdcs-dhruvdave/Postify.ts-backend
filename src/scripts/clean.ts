import sequelize from '../config/database';

const cleanDatabase = async () => {
  console.log('--- Starting database clean ---');

  try {
    console.log('🔄 Wiping all data by synchronizing schema...');
    // The force: true option drops all tables and recreates them,
    // effectively deleting all data.
    await sequelize.sync({ force: true });
    console.log('✅ Database is now empty and synchronized.');

  } catch (error) {
    console.error('❌ An error occurred during the cleaning process:', error);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
};

cleanDatabase();
