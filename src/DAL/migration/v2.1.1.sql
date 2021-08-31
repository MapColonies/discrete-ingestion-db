CREATE FUNCTION check_if_ingestion_job_is_in_progress()
    RETURNS TRIGGER
    LANGUAGE PLPGSQL
AS
$$
BEGIN
	IF EXISTS (SELECT FROM public."Job" j WHERE NEW."resourceId" = j."resourceId" AND
			  									NEW."version" = j."version" AND
			  									NEW.type = j."type" AND
			  									NEW."type" = 'Discrete-Tiling' AND
			  									(j.status = 'Pending' OR j.status = 'In-Progress')) THEN
		RAISE EXCEPTION 'An ingestion job with the same resource id: %, version: % is already in progress', NEW."resourceId", NEW.version USING ERRCODE = 'unique_violation';
	END IF;
	RETURN NEW;
END
$$;

CREATE TRIGGER check_if_ingestion_job_is_in_progress BEFORE INSERT ON public."Job" FOR EACH ROW EXECUTE PROCEDURE check_if_ingestion_job_is_in_progress();