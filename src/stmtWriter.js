/*

var jsonLD = require('jsonld');
var rdf = require('./constants/rdf');
var crm = require('./constants/crm');


function createLiteral(literal, opt_datatype, opt_language) {
  var res = {
    '@literal': literal
  };

  if (isNonEmptyString(opt_datatype)) {
    res['@datatype'] = opt_datatype;
  }

  if (isNonEmptyString(opt_language)) {
    res['@language'] = opt_language;
  }

  return res;
}


function StmtWriter(subjectIRI, subjectTypeIRI) {
  this.context = rdf.contexts[rdf.defaultContext];
  this.stmt = {};
  this.subEntities = {};
  this.completed = false;
}

StmtWriter.prototype.setSubjectIRI = function(iri) {
  if (!iri || typeof iri !== 'string' || !iri.length) {
    return;
  }

  this.stmt['@id'] = iri;
}

StmtWriter.prototype.isBlank = function() {
  return !this.stmt['@id'];
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
      writer.addActorName(writer.getRootNode(), payload.actorName);
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

function isNonEmptyString(arg) {
  return arg && typeof arg === 'string';
}

function isObject(arg) {
  return typeof arg === 'object';
}

StmtWriter.prototype.getRootNode = function() {
  return this.stmt;
};

StmtWriter.prototype.addActorName = function(actorNode, actorName) {
  if (!isNonEmptyString(actorName)) {
    throw new Error('Actor Name is empty or not formatted properly (it should be a string).');
  }

  var actorNameNode = {};
  actorNameNode['@type'] = crm.E82_ACTOR_APPELLATION_IRI;
  actorNameNode[rdf.RDFS_LABEL] = actorName;

  assignArrayValue(this.stmt, crm.P131_IS_IDENTIFIED_BY_IRI, actorNameNode);
};

StmtWriter.prototype.addSignatureImage = function(signatureImage) {
  if (!isObject(signatureImage) || !isNonEmptyString(signatureImage.hashKey)) {
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



StmtWriter.prototype.addImageDocument = function(imageDocument) {
  if (!isObject(imageDocument) || !isNonEmptyString(imageDocument.hashKey)) {
    throw new Error('Image document is empty or not formatted properly (it should be an object with a hash key).');
  }

  var imageDocumentNode = {};
  imageDocumentNode['@type'] = crm.E31_DOCUMENT_IRI;
  imageDocumentNode[crm.PX_HASH_KEY_IRI] = imageDocument.hashKey;

  if (isNonEmptyString(imageDocument.typeIRI)) {
    assignArrayValue(imageDocumentNode, crm.P2_HAS_TYPE_IRI, imageDocument.typeIRI);
  }

  if (isNonEmptyString(imageDocument.contextIRI)) {
    assignArrayValue(imageDocumentNode, crm.P2_HAS_TYPE_IRI, imageDocument.contextIRI);
  }

  assignArrayValue(this.stmt, crm.P70_IS_DOCUMENTED_IN_IRI, imageDocumentNode);

};

StmtWriter.prototype.addTitle = function(title) {
  if (!isNonEmptyString(title)) {
    throw new Error('Title is empty or not formatted properly (it should be a string).');
  }

  var titleNode = {};
  titleNode['@type'] = crm.E35_TITLE_IRI;
  titleNode[rdf.RDFS_LABEL] = title;

  assignArrayValue(this.stmt, crm.P102_HAS_TITLE_IRI, titleNode);
};

StmtWriter.prototype.addEdition = function(edition) {
  if (!isObject(edition) || (!isNonEmptyString(edition.index) && !isNonEmptyString(edition.volume))) {
    throw new Error('Edition is empty or not formatted properly (it should be an object with index and/or volume properties).');
  }

  var index = '';
  var volume = '';

  if (isNonEmptyString(edition.index)) {
    index = edition.index;
  }

  if (isNonEmptyString(edition.volume)) {
    volume = edition.volume;
  }

  var editionNode = {};
  editionNode['@type'] = crm.E42_IDENTIFIER_IRI;
  editionNode[crm.P2_HAS_TYPE_IRI] = {
    '@id': crm.IDENTIFIER_TYPE_EDITION_IRI
  };
  editionNode[rdf.RDFS_LABEL] = index && volume ? [index, volume].join(' / ') : (index || volume);

  assignArrayValue(this.stmt, crm.P1_IS_IDENTIFIED_BY_IRI, editionNode);
};


StmtWriter.prototype.addObjectType = function(typeIRI, opt_label) {
  if (!isNonEmptyString(typeIRI)) {
    throw new Error('Type is empty.');
  }

  var typeNode = {};
  typeNode['@id'] = typeIRI;
  typeNode[rdf.RDF_TYPE] = crm.E55_TYPE_IRI;

  if (isNonEmptyString(opt_label)) {
    typeNode[rdf.RDFS_LABEL] = opt_label;
  }


  assignArrayValue(this.stmt, crm.P2_HAS_TYPE_IRI, typeNode);
};


StmtWriter.prototype.addInventoryNumber = function(inventoryNumber) {
  if (!isNonEmptyString(inventoryNumber)) {
    throw new Error('Inventory number is empty.');
  }

  var inventoryNumberNode = {};
  inventoryNumberNode['@type'] = crm.E42_IDENTIFIER_IRI;
  inventoryNumberNode[crm.P2_HAS_TYPE_IRI] = {
    '@id': crm.IDENTIFIER_TYPE_INVENTORY_NUMBER_IRI
  };

  inventoryNumberNode[crm.RDFS_LABEL] = inventoryNumber;

  assignArrayValue(this.stmt, crm.P1_IS_IDENTIFIED_BY_IRI, inventoryNumberNode);
};


StmtWriter.prototype.addNote = function(note) {
  if (!isNonEmptyString(note)) {
    throw new Error('Note is empty.');
  }

  assignArrayValue(this.stmt, crm.P3_HAS_NOTE_IRI, note);
};

StmtWriter.prototype.addArtist = function(artist) {
  if (!isObject(artist)) {
    throw new Error('Artist is empty or not formatted properly.');
  }

  var defined = false;

  var actorNode = {};
  actorNode['@type'] = crm.E21_PERSON_IRI;

  if (isNonEmptyString(artist.sameAsIRI)) {
    defined = true;
    actorNode[rdf.OWL_SAME_AS] = {
      '@id': sameAsIRI
    };
  }

  if (isNonEmptyString(artist.name)) {
    defined = true;
    this.addActorName(actorNode, artist.name);
  }

  if (!defined) {
    throw new Error('Artist is not defined (requires a name or IRI).');
  }

  var production = this.getOrCreateProduction();
  assignArrayValue(production, crm.P14_CARRIED_OUT_BY_IRI, actorNode);
};

var xsdGYearRegExp = new RegExp('^\d{4}$')
var xsdDateRegExp = new RegExp('^\d{4}-\d{2}-\d{2}')

function assertDatatype(date, datatype) {
  switch (datatype) {
    case crm.XSD_GYEAR:
      return xsdGYearRegExp.test(date);
    case crm.XSD_DATE:
      return xsdDateRegExp.test(date);
    default:
      return false;
  }
}

StmtWriter.prototype.addProductionDate = function(productionDate) {
  if (!isObject(productionDate) || (!isNonEmptyString(productionDate.start) && !isNonEmptyString(productionDate.end)) || !isNonEmptyString(productionDate.datatype)) {
    throw new Error('Production date is not formatted properly (needs start or end and datatype).');
  }

  if (productionDate.datatype != crm.XSD_GYEAR) {
    throw new Error('Production date must be a year.');
  }

  

};

StmtWriter.prototype.getOrCreateProduction = function() {
  var production = this.subEntities[crm.P108_WAS_PRODUCED_BY_IRI];

  if (!production) {
    production = {};
    
    if (this.isBlank()) {
      production['@type'] = crm.E12_PRODUCTION_IRI;
    } else {
      throw new Error('Need to implement, getObjectProductionIRI');
    }

    this.subEntities[crm.P108_WAS_PRODUCED_BY_IRI] = production;
  }

  return production;
};

StmtWriter.prototype.getOrCreateBirth = function() {
  var birth = this.subEntities[crm.P98_WAS_BORN_IRI];

  if (!birth) {
    birth = {};
    
    if (this.isBlank()) {
      birth['@type'] = crm.E67_BIRTH_IRI;
    } else {
      throw new Error('Need to implement, getActorBirthIRI');
    }

    this.subEntities[crm.P98_WAS_BORN_IRI] = birth;
  }

  return birth;
};


StmtWriter.prototype.nodeHasNonTypeOutputs = function(node) {
  for (var prop in node) {
    if (prop !== '@type') {
      return true;
    }
  }

  return false;
};

StmtWriter.prototype.nodeIsEmpty = function(node) {
  // TODO:
  return false;
};

StmtWriter.prototype.attachSubEntities = function() {
  for (var prop in this.subEntities) {
    var subEntity = this.subEntities[prop];
    if (this.nodeHasNonTypeOutputs(subEntity)) {
      this.stmt[prop] = subEntity;
    }
  }
};

StmtWriter.prototype.isEmpty = function() {
  // tODO
  if (this.stmt == null) {
    return true;
  }

  if (!this.nodeIsEmpty(this.stmt)) {
    return false
  }

  if (!this.completed) {
    for (var prop in this.subEntities) {
      if (this.nodeHasNonTypeOutputs(this.subEntities[prop])) {
        return false;
      }
    }
  }
  
  return true;
};








StmtWriter.prototype.complete = function() {
  if (this.completed) {
    return;
  }

  if (!this.stmt['@id'] && !this.stmt['@type']) {
    // Can't complete not enough info
    return;
  }

  this.attachSubEntities();
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
*/