import {MigrationInterface, QueryRunner} from "typeorm";

export class migrationV1011615284669708 implements MigrationInterface {
    name = 'migrationV1011615284669708'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "partialTask_status_enum" AS ENUM('Pending', 'In-Progress', 'Completed', 'Failed')`);
        await queryRunner.query(`CREATE TABLE "partialTask" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "min_zoom" integer NOT NULL, "max_zoom" integer NOT NULL, "update_date" TIMESTAMP NOT NULL DEFAULT now(), "status" "partialTask_status_enum" NOT NULL DEFAULT 'Pending', "reason" character varying(300) NOT NULL DEFAULT '', "attempts" integer NOT NULL DEFAULT '0', "discrete_id" character varying(300), "discrete_version" character varying(30), CONSTRAINT "PK_4553cfbac778c9d26f612c616e1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_f1eb016b59ddf66230ce1c98ac" ON "partialTask" ("status") `);
        await queryRunner.query(`CREATE TYPE "discreteTask_status_enum" AS ENUM('Pending', 'In-Progress', 'Completed', 'Failed')`);
        await queryRunner.query(`CREATE TABLE "discreteTask" ("id" character varying(300) NOT NULL, "version" character varying(30) NOT NULL, "metadata" text NOT NULL, "update_date" TIMESTAMP NOT NULL DEFAULT now(), "status" "discreteTask_status_enum" NOT NULL DEFAULT 'In-Progress', "reason" character varying(300) NOT NULL DEFAULT '', CONSTRAINT "PK_4e21c005b98190afc28fa3e9e4d" PRIMARY KEY ("id", "version"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "discreteIndex" ON "discreteTask" ("id", "version") `);
        await queryRunner.query(`ALTER TABLE "partialTask" ADD CONSTRAINT "FK_6a1b5962c49b297e845710ba1d3" FOREIGN KEY ("discrete_id", "discrete_version") REFERENCES "discreteTask"("id","version") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "partialTask" DROP CONSTRAINT "FK_6a1b5962c49b297e845710ba1d3"`);
        await queryRunner.query(`DROP INDEX "discreteIndex"`);
        await queryRunner.query(`DROP TABLE "discreteTask"`);
        await queryRunner.query(`DROP TYPE "discreteTask_status_enum"`);
        await queryRunner.query(`DROP INDEX "IDX_f1eb016b59ddf66230ce1c98ac"`);
        await queryRunner.query(`DROP TABLE "partialTask"`);
        await queryRunner.query(`DROP TYPE "partialTask_status_enum"`);
    }

}
