import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateTableAndAddColumns1720078726992 implements MigrationInterface {
    name = 'CreateTableAndAddColumns1720078726992'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('admin', 'user')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "full_name" character varying(30) NOT NULL, "user_name" character varying(15) NOT NULL, "email" character varying(40) NOT NULL, "password" character varying NOT NULL, "deleted" boolean NOT NULL DEFAULT false, "role" "public"."user_role_enum" NOT NULL DEFAULT 'user', CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
