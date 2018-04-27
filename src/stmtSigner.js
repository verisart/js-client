var cryptoJS = require('crypto-js');
var ecdsa = require('elliptic').ec;


function StmtSigner(privKeyBytes) {
  this.ec = new ecdsa('secp256k1');
  this.keyPair = this.ec.keyFromPrivate(privKeyBytes);
  this.publicKey = this.keyPair.getPublic(true, 'hex');
}

StmtSigner.prototype.sign = function(msg) {
  if (typeof msg !== 'string') {
    return '';
  }

  // Base64 encode the stmt
  var msgBase64 = cryptoJS.enc.Base64.stringify(cryptoJS.enc.Utf8.parse(msg));
  var msgHash = cryptoJS.SHA256(msgBase64).toString(cryptoJS.enc.Hex);

  // Sign the hash
  var signature = this.keyPair.sign(msgHash);
  var signatureEnc = signature.toDER('hex');
  var signatureBase64 = cryptoJS.enc.Base64.stringify(cryptoJS.enc.Hex.parse(signatureEnc));

  return {
    payload: msgBase64,
    version: 1,
    signatures: [
      {
        publicKey: this.publicKey,
        fingerprint: this.publicKey,
        signature: signatureBase64
      }
    ]
  };
};

function sign(privKeyBytes, msg) {
  var signer = new StmtSigner(privKeyBytes);
  return signer.sign(msg);
}

function getPublicKey(privKeyBytes) {
  var signer = new StmtSigner(privKeyBytes);
  return signer.publicKey;
}

module.exports = {
  StmtSigner: StmtSigner,
  sign: sign,
  getPublicKey: getPublicKey,
  getFingerprint: getPublicKey
};