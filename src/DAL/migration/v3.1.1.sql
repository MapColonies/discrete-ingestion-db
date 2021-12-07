
-- usage: SELECT deleteTaskAndJobsByJobId('3fa85f64-5717-4562-b3fc-2c963f66afa6')
CREATE OR REPLACE FUNCTION deleteTaskAndJobsByJobId(jobId text) RETURNS bool AS $func$

BEGIN

delete from public."Task"
where "jobId" = jobId::uuid;

delete from public."Job"
where "id" = jobId::uuid;

RETURN true;

END
$func$ LANGUAGE plpgsql;

-- usage: SELECT deleteTaskAndJobsByJobType('jobString')
CREATE OR REPLACE FUNCTION deleteTaskAndJobsByJobType(jobType text) RETURNS bool AS $func$

BEGIN

delete from public."Task" where "jobId" in (select id from public."Job" where "type" = jobType);

delete from public."Job" where "type" = jobType;

RETURN true;

END
$func$ LANGUAGE plpgsql;
