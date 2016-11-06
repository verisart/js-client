var stmtWriter = require('../src/stmtWriter');
var crm = require('../src/constants/crm');
var rdf = require('../src/constants/rdf');


var testPayload = {
  actorName: 'Bob',
  signatureImage: {hashKey: 'deadbeef'}
};

var testJSONLD = {
  '@context': rdf.contexts[rdf.defaultContext],
  'vart:PX_image_signature': {
    '@type': 'crm:E73_Information_Object', 
    'vart:PX_hash_key': 'deadbeef'
  },
  'crm:P131_is_identified_by': {
    '@type': 'crm:E82_Actor_Appellation',
    'rdfs:label': 'Bob'
  }
};

var testActorIRI = 'http://www.verisart.com/id/actor/someuuid';


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
});