-- add priority filed

ALTER TABLE public."Job"
    ADD COLUMN priority int NOT NULL DEFAULT 1000;

CREATE INDEX "jobPriorityIndex"
    ON public."Job" USING btree
    (priority DESC NULLS LAST);


-- fixed timestamps timezone

-- note that if the timezone on the session that executing this script is the same 
-- as the time zone that was used in the session creating the data, it must be
-- specified manually be appending the following command after ea modification:
--  USING "<column name>" AT TIME ZONE '<time zone>'
-- time zone can be UTC or the difference from utc for example "+03"
--  full example: 
-- ALTER TABLE public."Task"
--    ALTER COLUMN "creationTime" TYPE timestamp with time zone USING "creationTime" AT TIME ZONE 'UTC';

ALTER TABLE public."Task"
    ALTER COLUMN "creationTime" TYPE timestamp with time zone;

ALTER TABLE public."Task"
    ALTER COLUMN "updateTime" TYPE timestamp with time zone;


ALTER TABLE public."Job"
    ALTER COLUMN "creationTime" TYPE timestamp with time zone;

ALTER TABLE public."Job"
    ALTER COLUMN "updateTime" TYPE timestamp with time zone;

