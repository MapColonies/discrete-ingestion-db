-- v2.1.0 db creation script --
-- please note that the update date is updated by typeOrm and not by trigger --

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TYPE public."operation_status_enum" AS ENUM
    ('Pending', 'In-Progress', 'Completed', 'Failed');

CREATE TABLE public."Job"
(
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "resourceId" character varying(300) COLLATE pg_catalog."default" NOT NULL,
  "version" character varying(30) COLLATE pg_catalog."default" NOT NULL,
  "type" character varying(255) COLLATE pg_catalog."default" NOT NULL,
  "description" character varying(2000) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
  "parameters" jsonb NOT NULL,
  "creationTime" timestamp with time zone NOT NULL DEFAULT now(),
  "updateTime" timestamp with time zone NOT NULL DEFAULT now(),
  "status" "operation_status_enum" NOT NULL DEFAULT 'Pending'::"operation_status_enum",
  "percentage" smallint,
  "reason" character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying,
  "isCleaned" boolean NOT NULL DEFAULT false,
  "priority" int NOT NULL DEFAULT 1000,
  CONSTRAINT "PK_job_id" PRIMARY KEY (id)
);

CREATE INDEX "jobCleanedIndex" 
  ON public."Job" USING btree 
  ("isCleaned" ASC NULLS LAST);

CREATE INDEX "jobResourceIndex"
  ON public."Job" USING btree
  ("resourceId" COLLATE pg_catalog."default" ASC NULLS LAST, version COLLATE pg_catalog."default" ASC NULLS LAST);

CREATE INDEX "jobStatusIndex"
  ON public."Job" USING btree
  (status ASC NULLS LAST);

CREATE INDEX "jobTypeIndex"
    ON public."Job" USING btree
    (type COLLATE pg_catalog."default" ASC NULLS LAST);

CREATE INDEX "jobPriorityIndex"
    ON public."Job" USING btree
    (priority DESC NULLS LAST);


CREATE TABLE public."Task"
(
  "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
  "type" character varying(255) COLLATE pg_catalog."default" NOT NULL,
  "description" character varying(2000) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying, 
  "parameters" jsonb NOT NULL,
  "creationTime" timestamp with time zone NOT NULL DEFAULT now(),
  "updateTime" timestamp with time zone NOT NULL DEFAULT now(),
  "status" "operation_status_enum" NOT NULL DEFAULT 'Pending'::"operation_status_enum",
  "percentage" smallint, 
  "reason" character varying(255) COLLATE pg_catalog."default" NOT NULL DEFAULT ''::character varying, 
  "attempts" integer NOT NULL DEFAULT 0,
  "jobId" uuid NOT NULL,
  CONSTRAINT "PK_task_id" PRIMARY KEY (id), 
  CONSTRAINT "FK_task_job_id" FOREIGN KEY ("jobId") REFERENCES public."Job" (id) MATCH SIMPLE ON UPDATE NO ACTION ON DELETE NO ACTION
);