var jsonLD = require('jsonld');
var rdf = require('./constants/rdf');
var crm = require('./constants/crm');


function StmtWriter(subjectIRI, subjectTypeIRI) {
  this.context = rdf.contexts[rdf.defaultContext];
  this.stmt = {};
  this.completed = false;
}

StmtWriter.prototype.setSubjectIRI = function(iri) {
  if (!iri || typeof iri !== 'string' || iri.length === 0) {
    return;
  }

  this.stmt['@id'] = iri;
}

StmtWriter.prototype.setSubjectTypeIRI = function(iri) {
  if (!iri || typeof iri !== 'string' || iri.length === 0) {
    return;
  }

  this.stmt['@type'] = iri;
}

function newCreateActorStmtWriter() {
  var writer = new StmtWriter();
  writer.setSubjectTypeIRI(crm.E39_ACTOR_IRI);
  return writer;
}

function newUpdateActorStmtWriter(iri) {
  var writer = new StmtWriter();
  writer.setSubject(iri);
  return writer;
}



function writeCreateActorStmt(payload, cb) {
  var writer = newCreateActorStmtWriter();
  if (payload.actorName) {
    writer.addActorName(payload.actorName);
  }
  writer.complete();
  writer.frame(cb);
}

function writeUpdateActorStmt(iri, payload, cb) {
  var writer = newUpdateActorStmtWriter(iri);
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
  if (!this.stmt['@id'] && ! this.stmt['@type']) {
    // Can't complete not enough info
    return;
  }

  this.completed = true;
};

StmtWriter.prototype.frame = function(cb) {
  if (!this.completed) {
    cb('The writer is not complete');
    return;
  }

  jsonLD.compact(this.stmt, this.context, function(err, compacted) {
    cb(err, compacted);
  });
};

module.exports = {
  StmtWriter: StmtWriter,
  writeCreateActorStmt: writeCreateActorStmt,
  writeUpdateActorStmt: writeUpdateActorStmt
};