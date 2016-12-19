var core = require('../src/core');

var testPayload = {
  actorName: 'Bob',
  signatureImage: {hashKey: 'deadbeef'}
};

var testJSONLD = {
  '@context': {},/*rdf.contexts[rdf.defaultContext],*/
  'vart:PX1_produced_signature_document': {
    '@type': 'crm:E31_Document', 
    'vart:PX_hash_key': 'deadbeef',
    'crm:P2_has_type': {
      '@id': 'thes:signature/image'
    }
  },
  'crm:P131_is_identified_by': {
    '@type': 'crm:E82_Actor_Appellation',
    'rdfs:label': 'Bob'
  }
};

var testActorIRI = 'http://www.verisart.com/id/actor/someuuid';

var testObjectPayload = {
  [core.certify.FieldNameArtistName]: "Bob",
  [core.certify.FieldNameTitle]: "My title",
  [core.certify.FieldNameDimensions]: [
    {
      type: core.crm.DimensionTermHeight,
      unit: core.crm.UnitTermInch,
      value: "100"
    }
  ],
  [core.certify.FieldNameMedium]: "a medium",
  [core.certify.FieldNameImages]: [
    {
      [core.certify.FieldNameHashKey]: 'somehashkey',
      [core.certify.FieldNameDocumentType]: core.crm.ImageDocumentFront,
      [core.certify.FieldNameCaptureContext]: core.crm.CaptureContextWebUpload
    }
  ]
};




describe('certifyObject', function() {
  it('writes a statement to create an object entity', function () {
    let [result, error] = core.certifyObject(testObjectPayload);
    //console.log(testObjectPayload);
    //console.log(error.errors);
    expect(result).toBeTruthy();
    expect(error).toBeFalsy();
    /*
    return new Promise(function(resolve, reject) {
      var writer = core.certify.certifyObject(testPayload, function (err, res) {
        expect(err).toBeFalsy();
        expect(res).toEqual(Object.assign({'@type': 'crm:E39_Actor'}, testJSONLD));
        resolve();
      })
    });*/
  })
});
/*

describe('writeCreateActorStmt', function() {
  pit('writes a statement to create an actor entity', function () {
    return new Promise(function(resolve, reject) {
      var writer = stmtWriter.writeCreateActorStmt(testPayload, function (err, res) {
        expect(err).toBeFalsy();
        expect(res).toEqual(Object.assign({'@type': 'crm:E39_Actor'}, testJSONLD));
        resolve();
      })
    });
  })
});

describe('writeUpdateActorStmt', function() {
  pit('writes a statement to update an actor entity', function () {
    return new Promise(function(resolve, reject) {
      var writer = stmtWriter.writeUpdateActorStmt(testActorIRI, testPayload, function (err, res) {
        expect(err).toBeFalsy();
        expect(res).toEqual(Object.assign({'@id': testActorIRI}, testJSONLD));
        resolve();
      })
    });
  })
});*/