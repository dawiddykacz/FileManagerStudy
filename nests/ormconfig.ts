import { DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
dotenv.config();

const options: DataSourceOptions = {
  type: 'sqlite',
  database: process.env.DATABASE_FILE || './sqlite/database.sqlite',
  entities: ['dist/**/*.entity.js'],
  synchronize: true,
};

export default options;