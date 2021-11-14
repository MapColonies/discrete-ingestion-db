ALTER TABLE public."Job"
  ADD COLUMN "expirationDate" timestamp with time zone;

CREATE INDEX "jobExpirationDateIndex"
    ON public."Job" USING btree
    ("expirationDate" DESC NULLS LAST);

ALTER TYPE operation_status_enum ADD VALUE 'Expired';
