--  ************************************** note ******************************************
--        this script will fail to run if there are duplicate active jobs in db
-- ***************************************************************************************
ALTER TABLE public."Job" 
  ADD CONSTRAINT UQ_uniqueness_on_active_tasks EXCLUDE ("resourceId" with =, version with =, type with =) WHERE (status = 'Pending' OR status = 'In-Progress');
