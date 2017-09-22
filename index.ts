import * as fs from 'fs';
import * as restify from 'restify';
import * as sqlite3 from 'sqlite3';
import * as errors from 'restify-errors';
import config from './config';

const server = restify.createServer({
  name: 'temp-api',
  version: '0.0.1'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());

server.get('/latest', function (req, res, next) {
  const db = new sqlite3.Database(config.sqliteDbFilePathAndName);
  const tableName = req.query.table ? req.query.table.replace(/[^a-zA-Z0-9]/gi, '') : '';

  if (!tableName) {
    return next(new errors.BadRequestError("'table' query param is empty"));
  }

  const sql = `SELECT id, ts, cast(temperature as text) as temperature FROM ${tableName} ORDER BY ts DESC LIMIT 1`;

  db.get(sql, function(err, row) {
    if (err) {
      return next(new errors.BadRequestError(err));
    }
    res.send(row);
    next();
  });

  db.close();
});

if (fs.existsSync(config.sqliteDbFilePathAndName)) {
  server.listen(config.port, function () {
    console.log(`${server.name} listening at ${server.url} using ${config.sqliteDbFilePathAndName}`);
  });
} else {
  console.log(`Sqlite file not found: ${config.sqliteDbFilePathAndName}`);
}
