export const ENV = {
  JWT_SECRET: process.env.JWT_SECRET || 'supersecretjwtkey',
  DB_DATABASE: process.env.DB_DATABASE || 'postify_db',
  DB_USER: process.env.DB_USER || 'postgres',
  DB_HOST: process.env.DB_HOST || 'localhost',
  DB_PASSWORD: process.env.DB_PASSWORD || 'password',
  DB_PORT: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
};