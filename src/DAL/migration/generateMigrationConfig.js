const config = require('config');
const fs = require('fs');

const ormConfig = config.get('typeOrm');
if (ormConfig.ssl && ormConfig.ssl.ca && ormConfig.ssl.cert && ormConfig.ssl.key) {
  const sslOptions = {
    rejectUnauthorized: ormConfig.ssl.rejectUnauthorized,
    ca: fs.readFileSync(ormConfig.ssl.ca, 'utf-8'),
    cert: fs.readFileSync(ormConfig.ssl.cert, 'utf-8'),
    key: fs.readFileSync(ormConfig.ssl.key, 'utf-8'),
  };
  ormConfig.ssl = sslOptions;
}

if (fs.existsSync('./src/DAL/migration/ormConfig.json')) {
  fs.unlinkSync('./src/DAL/migration/ormConfig.json');
}
fs.writeFileSync('./src/DAL/migration/ormConfig.json', JSON.stringify(ormConfig));
