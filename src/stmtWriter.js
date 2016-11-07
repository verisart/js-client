var jsonLD = require('jsonld');
var rdf = require('./constants/rdf');
var crm = require('./constants/crm');


function StmtWriter(subjectIRI, subjectTypeIRI) {
  this.context = rdf.contexts[rdf.defaultContext];
  this.stmt = {};
  this.completed = false;
}

StmtWriter.prototype.setSubjectIRI = function(iri) {
  if (!iri || typeof iri !== 'string' || !iri.length) {
    return;
  }

  this.stmt['@id'] = iri;
}

StmtWriter.prototype.setSubjectTypeIRI = function(iri) {
  if (!iri || typeof iri !== 'string' || !iri.length) {
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
  writer.setSubjectIRI(iri);
  return writer;
}



function writeCreateActorStmt(payload, cb) {
  return writeActorPayload(newCreateActorStmtWriter(), payload, cb);
}

function writeActorPayload(writer, payload, cb) {
  try {
    if (payload.actorName) {
      writer.addActorName(payload.actorName);
    }

    if (payload.signatureImage) {
      writer.addSignatureImage(payload.signatureImage);
    }
  } catch (err) {
    cb(err);
    return;
  }

  writer.complete();
  writer.frame(cb);
}

function writeUpdateActorStmt(iri, payload, cb) {
  return writeActorPayload(newUpdateActorStmtWriter(iri), payload, cb);
}

function assignArrayValue(object, path, value) {
  var arr = object[path] || [];
  arr.push(value);
  return object[path] = arr;
}

StmtWriter.prototype.addActorName = function(actorName) {
  if (typeof actorName !== 'string' || !actorName.length) {
    throw new Error('Actor Name is empty or not formatted properly (it should be a string).');
  }

  var actorNameNode = {};
  actorNameNode['@type'] = crm.E82_ACTOR_APPELLATION_IRI;
  actorNameNode[rdf.RDFS_LABEL] = actorName;

  assignArrayValue(this.stmt, crm.P131_IS_IDENTIFIED_BY_IRI, actorNameNode);
};

StmtWriter.prototype.addSignatureImage = function(signatureImage) {
  if (typeof signatureImage !== 'object' || typeof signatureImage.hashKey !== 'string' || !signatureImage.hashKey.length) {
    throw new Error('Signature Image is empty or not formatted properly (it should be an object with a hash key).');
  }

  var signatureNode = {};
  signatureNode['@type'] = crm.E31_DOCUMENT_IRI;
  signatureNode[crm.PX_HASH_KEY_IRI] = signatureImage.hashKey;
  signatureNode[crm.P2_HAS_TYPE_IRI] = {
    '@id': crm.SIGNATURE_TYPE_IMAGE_IRI
  };

  assignArrayValue(this.stmt, crm.PX1_PRODUCED_SIGNATURE_DOCUMENT_IRI, signatureNode);
};


StmtWriter.prototype.complete = function() {
  if (!this.stmt['@id'] && !this.stmt['@type']) {
    // Can't complete not enough info
    return;
  }

  this.completed = true;
};

StmtWriter.prototype.frame = function(cb) {
  if (!this.completed) {
    cb(new Error('The writer is not complete'));
    return;
  }

  jsonLD.compact(this.stmt, this.context, function(err, compacted) {
    cb(err, compacted);
  });
};

module.exports = {
  writeCreateActorStmt: writeCreateActorStmt,
  writeUpdateActorStmt: writeUpdateActorStmt
};