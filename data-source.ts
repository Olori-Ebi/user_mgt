require('dotenv').config();
import {  DataSource, DataSourceOptions} from 'typeorm';

export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    logging: true,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/src/migrations/*.js'],
    synchronize: false,
}

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;