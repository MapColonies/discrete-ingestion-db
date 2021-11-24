ALTER TABLE public."Task"
  ADD COLUMN "resettable" BOOLEAN NOT NULL DEFAULT TRUE;

CREATE INDEX "taskResettableIndex"
    ON public."Task" ("resettable")
    WHERE "resettable" = FALSE;
