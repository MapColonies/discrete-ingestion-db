ALTER TABLE public."Job"
    ADD COLUMN priority int NOT NULL DEFAULT 1000;

CREATE INDEX "jobPriorityIndex"
    ON public."Job" USING btree
    (priority DESC NULLS LAST);
