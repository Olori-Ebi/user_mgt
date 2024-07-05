import { MigrationInterface, QueryRunner } from "typeorm";
import * as bcrypt from 'bcryptjs';
import { UserRole } from "src/user/entities/user.entity";

export class InsertUsers1720162020958 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        const saltRounds = 10;

        const adminPassword1 = await bcrypt.hash('AdminPassword1', saltRounds);
        const adminPassword2 = await bcrypt.hash('AdminPassword2', saltRounds);
        const userPassword1 = await bcrypt.hash('UserPassword1', saltRounds);
        const userPassword2 = await bcrypt.hash('UserPassword2', saltRounds);

        // Insert admin users
        await queryRunner.query(`
            INSERT INTO "user" (email, user_name, full_name, password, role)
            VALUES 
                ('admin1@example.com', 'adminuser1', 'Admin User One', '${adminPassword1}', '${UserRole.ADMIN}'),
                ('admin2@example.com', 'adminuser2', 'Admin User Two', '${adminPassword2}', '${UserRole.ADMIN}')
        `);

        // Insert regular users
        await queryRunner.query(`
            INSERT INTO "user" (email, user_name, full_name, password, role)
            VALUES 
                ('user1@example.com', 'regularuser1', 'Regular User One', '${userPassword1}', '${UserRole.USER}'),
                ('user2@example.com', 'regularuser2', 'Regular User Two', '${userPassword2}', '${UserRole.USER}')
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Remove the users that were inserted
        await queryRunner.query(`
            DELETE FROM "user" 
            WHERE email IN (
                'admin1@example.com', 
                'admin2@example.com', 
                'user1@example.com', 
                'user2@example.com'
            )
        `);
    }
}
