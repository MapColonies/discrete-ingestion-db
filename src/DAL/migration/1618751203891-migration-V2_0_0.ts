import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationV2001618751203891 implements MigrationInterface {
    name = 'migrationV2001618751203891'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "Task_status_enum" AS ENUM('Pending', 'In-Progress', 'Completed', 'Failed')`);
        await queryRunner.query(`CREATE TABLE "Task" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" character varying(255) NOT NULL, "description" character varying(2000) NOT NULL DEFAULT '', "parameters" jsonb NOT NULL, "creationTime" TIMESTAMP NOT NULL DEFAULT now(), "updateTime" TIMESTAMP NOT NULL DEFAULT now(), "status" "Task_status_enum" NOT NULL DEFAULT 'Pending', "percentage" smallint, "reason" character varying(255) NOT NULL DEFAULT '', "attempts" integer NOT NULL DEFAULT '0', "jobId" uuid NOT NULL, CONSTRAINT "PK_95d9364b8115119ba8b15a43592" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "Job_status_enum" AS ENUM('Pending', 'In-Progress', 'Completed', 'Failed')`);
        await queryRunner.query(`CREATE TABLE "Job" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "resourceId" character varying(300) NOT NULL, "version" character varying(30) NOT NULL, "type" character varying(255) NOT NULL, "description" character varying(2000) NOT NULL DEFAULT '', "parameters" jsonb NOT NULL, "creationTime" TIMESTAMP NOT NULL DEFAULT now(), "updateTime" TIMESTAMP NOT NULL DEFAULT now(), "status" "Job_status_enum" NOT NULL DEFAULT 'Pending', "percentage" smallint, "reason" character varying(255) NOT NULL DEFAULT '', "isCleaned" boolean NOT NULL DEFAULT false, CONSTRAINT "PK_981d90e7185b9ec1ee6b814ec21" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "jobCleanedIndex" ON "Job" ("isCleaned") `);
        await queryRunner.query(`CREATE INDEX "jobTypeIndex" ON "Job" ("type") `);
        await queryRunner.query(`CREATE INDEX "jobStatusIndex" ON "Job" ("status") `);
        await queryRunner.query(`CREATE INDEX "jobResourceIndex" ON "Job" ("resourceId", "version") `);
        await queryRunner.query(`ALTER TABLE "Task" ADD CONSTRAINT "FK_d713577c46981551c73f8e7cba2" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "Task" DROP CONSTRAINT "FK_d713577c46981551c73f8e7cba2"`);
        await queryRunner.query(`DROP INDEX "jobResourceIndex"`);
        await queryRunner.query(`DROP INDEX "jobStatusIndex"`);
        await queryRunner.query(`DROP INDEX "jobTypeIndex"`);
        await queryRunner.query(`DROP INDEX "jobCleanedIndex"`);
        await queryRunner.query(`DROP TABLE "Job"`);
        await queryRunner.query(`DROP TYPE "Job_status_enum"`);
        await queryRunner.query(`DROP TABLE "Task"`);
        await queryRunner.query(`DROP TYPE "Task_status_enum"`);
    }

}
