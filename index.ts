import * as restify from 'restify';
import * as sqlite3 from 'sqlite3';
import * as errors from 'restify-errors';

const server = restify.createServer({
  name: 'myapp',
  version: '1.0.0'
});

server.use(restify.plugins.acceptParser(server.acceptable));
server.use(restify.plugins.queryParser());

server.get('/sqlite_latest_row', function (req, res, next) {
  const db = new sqlite3.Database('db.sqlite');
  const tableName = req.query.table.replace(/[^a-zA-Z0-9]/gi, '');

  db.get(`SELECT id, ts, temperature FROM ${tableName} ORDER BY ts DESC LIMIT 1`, function(err, row) {
    if (err) {
      return next(new errors.BadRequestError(err));
    }
    res.send(row);
    next();
  });

  db.close();
});

server.listen(8080, function () {
  console.log('%s listening at %s', server.name, server.url);
});
