var stmtWriter = require('../src/stmtWriter');
var crm = require('../src/constants/crm');

describe('StmtWriter', function() {
  pit('creates StmtWriter with proper subject type', function () {
    return new Promise(function(resolve, reject) {
      var writer = stmtWriter.newActorStmtWriter();
      writer.complete();
      writer.frame(function(err, framed) {
        expect(framed['@type']).toEqual('crm:E39_Actor');
        resolve();
      });
    });
  })
});