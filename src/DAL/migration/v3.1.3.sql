ALTER TABLE public."Job"
  ADD COLUMN "extraConstraintData" text COLLATE pg_catalog."default" NOT NULL DEFAULT ''::text,
  DROP CONSTRAINT "UQ_uniqueness_on_active_tasks",
  ADD CONSTRAINT "UQ_uniqueness_on_active_tasks" EXCLUDE ("resourceId" with =, "version" with =, "type" with =, "extraConstraintData" with =) WHERE (status = 'Pending' OR status = 'In-Progress');

CREATE INDEX "extraConstraintDataIndex"
  ON public."Job" USING btree
  ("extraConstraintData" ASC NULLS LAST);
