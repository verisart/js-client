var crmConstants = require('./constants/crm');
var rdfConstants = require('./constants/rdf');
var stmtSigner = require('./stmtSigner');
var stmtWriter = require('./stmtWriter');

module.exports = {
  rdf: rdfConstants,
  crm: crmConstants,
  stmtSigner: stmtSigner,
  stmtWriter: stmtWriter
};