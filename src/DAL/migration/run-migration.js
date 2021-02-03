require('./generateMigrationConfig');
const exec = require('child_process').exec;
exec(`npm run typeorm -- migration:run -f ./src/DAL/migration/ormConfig.json`, (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    console.error(err);
  } else {
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  }
});
