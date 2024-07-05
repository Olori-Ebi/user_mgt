require('dotenv').config();
import { User, UserRole } from 'src/user/entities/user.entity';
import {  DataSource, DataSourceOptions} from 'typeorm';


export const dataSourceOptions: DataSourceOptions = {
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DATABASE,
    logging: false,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/db/migrations/*.js'],
    synchronize: true,
}

const dataSource = new DataSource(dataSourceOptions);

async function seedAdminUser() {
    try {
      await dataSource.initialize();
  
      const adminUser = new User();
      adminUser.full_name = 'Admin User';
      adminUser.user_name = 'admin';
      adminUser.email = 'admin2@gmail.com';
      adminUser.password = 'AdminPassword@123';
      adminUser.role = UserRole.ADMIN;
      const existingAdmin = await dataSource.getRepository(User).findOneBy({ email: adminUser.email });
      if (!existingAdmin) {
        await dataSource.manager.save(adminUser);
        console.log('Admin user seeded successfully');
      } else {
        console.log('Admin user already exists');
      }
     
    } catch (error) {
      console.error('Error seeding admin user:', error);
    } finally {
      await dataSource.destroy();
    }
  }
  
  seedAdminUser();

export default dataSource;