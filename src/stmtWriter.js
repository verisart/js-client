var jsonLD = require('jsonld');
var rdf = require('./constants/rdf');
var crm = require('./constants/crm');


function StmtWriter(subjectTypeIRI) {
  this.context = rdf.contexts[rdf.defaultContext];
  this.stmt = {};
  this.completed = false;

  this.stmt['@type'] = subjectTypeIRI;
}

function newActorStmtWriter() {
  return new StmtWriter(crm.E39_ACTOR_IRI);
}

function writeActorStmt(payload, cb) {
  var writer = newActorStmtWriter();
  if (payload.actorName) {
    writer.addActorName(payload.actorName);
  }
  writer.complete();
  writer.frame(cb);
}

function assignArrayValue(object, path, value) {
  var arr = object[path] || [];
  arr.push(value);
  return object[path] = arr;
}

StmtWriter.prototype.addActorName = function(actorName) {
  if (typeof actorName !== 'string') {
    return
  }

  var actorNameNode = {};
  actorNameNode['@type'] = crm.E82_ACTOR_APPELLATION_IRI;
  actorNameNode[rdf.RDFS_LABEL] = actorName;

  assignArrayValue(this.stmt, crm.P131_IS_IDENTIFIED_BY_IRI, actorNameNode);
};


StmtWriter.prototype.complete = function() {
  this.completed = true;
};

StmtWriter.prototype.frame = function(cb) {
  jsonLD.compact(this.stmt, this.context, function(err, compacted) {
    cb(err, compacted);
  });
};

module.exports = {
  StmtWriter: StmtWriter,
  newActorStmtWriter: newActorStmtWriter,
  writeActorStmt: writeActorStmt
};