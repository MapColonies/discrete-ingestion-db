require('./generateMigrationConfig');
const exec = require('child_process').exec;
let version = require('../../../package.json').version;

const replacePattern = new RegExp('[.]', 'g');
version = version.replace(replacePattern, '_');
const name = `migration-V${version}`;
exec(`npm run typeorm -- migration:generate -f ./src/DAL/migration/ormConfig.json -n ${name}`, (err, stdout, stderr) => {
  if (err) {
    //some err occurred
    console.error(err);
  } else {
    // the *entire* stdout and stderr (buffered)
    console.log(`stdout: ${stdout}`);
    console.log(`stderr: ${stderr}`);
  }
});
