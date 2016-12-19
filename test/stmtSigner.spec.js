var stmtSigner = require('../src/stmtSigner');

describe('StmtSigner', function() {
  it('creates a StmtSigner and signs a message', function () {
    var signer = new stmtSigner.StmtSigner('a6fb698ed6bfa2a2053cb0a9e897b8592b27b86485fc337a2897a091861942c9');
    var result = signer.sign('this is a message');

    expect(result).toEqual({
      "payload": "dGhpcyBpcyBhIG1lc3NhZ2U=",
      "version": 1,
      "signatures": [{
          "publicKey": "0231a0e610bd39850bba7501e855896c2d0c45afbc84bed79838337567ae27c483",
          "fingerprint": "0231a0e610bd39850bba7501e855896c2d0c45afbc84bed79838337567ae27c483",
          "signature": "MEUCIQCnaOErAp8ASofzXTqHwTGJZ53B7qwjk15iqewUEdODtAIgc7L1E/FEZW54GjrWiJsn8wQioCkHKhfmPhIMBWnPHnQ="
        }]
    });
  });
});