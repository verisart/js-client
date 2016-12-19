var jsonLD = require('jsonld');
var rdf = require('./constants/rdf');
var crm = require('./constants/crm');

/*
var iriPattern = '(?:<([^:]+:[^>]*)>)';
var plainPattern = '"([^"\\\\]*(?:\\\\.[^"\\\\]*)*)"';
var datatypePattern = '(?:\\^\\^' + iri + ')';
var languagePattern = '(?:@([a-z]+(?:-[a-z0-9]+)*))';
var literalPattern = '(?:' + plainRegEx + '(?:' + datatypeRegEx + '|' + languageRegEx + ')?)';

var literalRegExp = new RegExp('^' + literal + '$');

function isNonEmptyLiteral(literal) {
  if (!isNonEmptyString(literal)) {
    return false;
  }

  return literalRegExp.text(literal);
}
*/

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

/*
 Edition has an index which must be an integer or AP, HC, etc., and then a volume
 which can be any string.
*/
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

/*



func (stmt *stmtWriter) AddProductionDate(date *crmjson.Literal) error {
  if date == nil || date.IsEmpty() {
    return ErrParamEmpty
  }

  if date.Datatype != crm.XSDGYear {
    return newStmtWriterErr(
      ErrCodeDateTypeUnknown,
      func(T goi18n.TranslateFunc) string {
        return T("Dates must use a year datatype.")
      })
  }

  if !crmjson.ValidateDate(date.Value, date.Datatype) {
    return newStmtWriterErr(
      ErrCodeDateInvalid,
      func(T goi18n.TranslateFunc) string {
        return T("The date should be a valid year in the format YYYY.")
      })
  }

  timespan := stmt.entity.NewTypedBlankNode(crm.E52_TIME_SPAN_IRI)
  timespan.ConnectLiteral(crm.P82_AT_SOME_TIME_WITHIN_IRI, date)
  production := stmt.getOrCreateProduction()
  production.ConnectObject(crm.P4_HAS_TIME_SPAN_IRI, timespan)
  return nil
}

func (stmt *stmtWriter) AddDimension(dim crm.DimensionTerm, unit crm.UnitTerm, value *crmjson.Literal) error {
  if value == nil || value.IsEmpty() {
    return ErrParamEmpty
  }

  if !crmjson.ValidateDimension(value.Value, unit) {
    return newStmtWriterErr(
      ErrCodeDimensionInvalid,
      func(T goi18n.TranslateFunc) string {
        return T("Dimensions must be numeric.")
      })
  }

  dimension := stmt.entity.NewTypedBlankNode(crm.E54_DIMENSION_IRI)
  stmt.entity.Root().ConnectObject(crm.P43_HAS_DIMENSION_IRI, dimension)

  dimTermNode := stmt.entity.NewIRINode(dim.IRI())
  dimTermNode.SetRDFType(crm.E55_TYPE_IRI)
  dimTermNode.SetRDFLabel(crmjson.NewStringLiteral(dim.Label()))

  unitTermNode := stmt.entity.NewIRINode(unit.IRI())
  unitTermNode.SetRDFType(crm.E58_MEASUREMENT_UNIT_IRI)
  unitTermNode.SetRDFLabel(crmjson.NewStringLiteral(unit.Label()))

  dimension.ConnectObject(crm.P2_HAS_TYPE_IRI, dimTermNode)
  dimension.ConnectObject(crm.P91_HAS_UNIT_IRI, unitTermNode)
  dimension.ConnectLiteral(crm.P90_HAS_VALUE_IRI, value)
  return nil
}

func (stmt *stmtWriter) AddDim2D(height *crmjson.Literal, width *crmjson.Literal, unit crm.UnitTerm) error {
  if height == nil || height.IsEmpty() || width == nil || width.IsEmpty() || unit.IRI() == "" {
    return ErrParamEmpty
  }

  // TODO: validate unit, validate values
  err := stmt.AddDimension(crm.DimensionTermWidth, unit, width)
  if err != nil {
    return err
  }

  err = stmt.AddDimension(crm.DimensionTermHeight, unit, height)
  if err != nil {
    return err
  }

  return nil
}

func (stmt *stmtWriter) AddMedium(medium *Medium) error {
  defined := false

  if medium.Note != nil && !medium.Note.IsEmpty() {
    defined = true
    stmt.getOrCreateProduction().
      ConnectLiteral(crm.PX_MEDIUM_NOTE_IRI, medium.Note)
  }

  for _, material := range medium.Materials {
    if !material.IsEmpty() {
      defined = true

      materialTermNode := stmt.entity.NewIRINode(material.IRI)
      materialTermNode.SetRDFType(crm.E57_MATERIAL_IRI)

      if material.Label != nil && !material.Label.IsEmpty() {
        materialTermNode.SetRDFLabel(material.Label)
      }

      stmt.getOrCreateProduction().
        ConnectObject(crm.P126_EMPLOYED_IRI, materialTermNode)
    }
  }

  for _, technique := range medium.Techniques {
    if !technique.IsEmpty() {
      defined = true

      techniqueTermNode := stmt.entity.NewIRINode(technique.IRI)
      techniqueTermNode.SetRDFType(crm.E55_TYPE_IRI)

      if technique.Label != nil && !technique.Label.IsEmpty() {
        techniqueTermNode.SetRDFLabel(technique.Label)
      }

      stmt.getOrCreateProduction().
        ConnectObject(crm.P32_USED_GENERAL_TECHNIQUE_IRI, techniqueTermNode)
    }
  }

  if !defined {
    return ErrParamEmpty
  }

  return nil
}

func (stmt *stmtWriter) AddCurrentLocation(location *Location) error {
  var place crmjson.EntityNode
  defined := false

  if location.Term != nil && !location.Term.IsEmpty() {
    // TODO: validate term?
    place = stmt.entity.NewIRINode(location.Term.IRI).
      SetRDFType(crm.E53_PLACE_IRI)
    defined = true
  } else {
    place = stmt.entity.NewTypedBlankNode(crm.E53_PLACE_IRI)
  }

  if location.Lat != nil && !location.Lat.IsEmpty() && location.Lng != nil && !location.Lng.IsEmpty() {
    defined = true

    if !crmjson.ValidateLatitude(location.Lat.Value) || !crmjson.ValidateLongitude(location.Lng.Value) {
      return newStmtWriterErr(
        ErrCodeLatLngInvalid,
        func(T goi18n.TranslateFunc) string {
          return T("The ({{.Lat}}, {{.Lng}}) is not a valid coordinate.",
            map[string]interface{}{
              "Lat": location.Lat.Value,
              "Lng": location.Lng.Value,
            })
        })
    }

    coord := stmt.entity.NewTypedBlankNode(crm.E47_SPATIAL_COORDINATES_IRI)
    coord.ConnectLiteral(crm.WGSLat, crmjson.NewTypedLiteral(location.Lat.Value, crm.XSDDecimal))
    coord.ConnectLiteral(crm.WGSLng, crmjson.NewTypedLiteral(location.Lng.Value, crm.XSDDecimal))
    place.ConnectObject(crm.P87_IS_IDENTIFIED_BY_IRI, coord)
  }

  if location.Name != nil && !location.Name.IsEmpty() {
    place.ConnectLiteral(crm.RDFSLabel, location.Name)
    defined = true
  }

  if !defined {
    return ErrParamEmpty
  }

  stmt.entity.Root().ConnectObject(crm.P55_HAS_CURRENT_LOCATION_IRI, place)
  return nil
}

// Call this to store information about the owner
func (stmt *stmtWriter) AddOwner(actor *Actor) error {
  if actor == nil || actor.IRI == "" {
    return ErrParamEmpty
  }
  // defined := true // false
  // TODO: this only makes sense for an object statement

  // TODO: check if actor sameAs is a verisart id, if so, we can just use that
  // instead of a blank node
  actorNode := stmt.entity.NewIRINode(actor.IRI)
  stmt.entity.Root().ConnectObject(crm.P52_HAS_CURRENT_OWNER_IRI, actorNode)
  return nil
}

// Call this when you want to endorse an actor as the owner.
func (stmt *stmtWriter) AddFormerOrCurrentOwner(actor *Actor) error {
  if actor == nil || actor.IRI == "" {
    return ErrParamEmpty
  }
  // defined := true // false
  // TODO: this only makes sense for an object statement

  // TODO: check if actor sameAs is a verisart id, if so, we can just use that
  // instead of a blank node

  //crm.VerisartActorIRIByUUID(actor_id)
  actorNode := stmt.entity.NewIRINode(actor.IRI)
  stmt.entity.Root().ConnectObject(crm.P51_HAS_FORMER_OR_CURRENT_OWNER_IRI, actorNode)
  return nil
}
*/


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