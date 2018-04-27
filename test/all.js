var pkcs7 = require('../index.js');

var str14 = 'this is a text';
var str21 = 'this is a longer text';
var buf14 = new Uint8Array(14);
var buf21 = new Uint8Array(21);
var cbuf14 = new Uint8ClampedArray(14);
var cbuf21 = new Uint8ClampedArray(21);

describe('The pad() function', function () {
  it('can be called on either a string or a buffer', function () {
    expect(typeof pkcs7.pad(str14) === 'string').toBe(true);
    expect(pkcs7.pad(buf14) instanceof Uint8Array).toBe(true);
    expect(pkcs7.pad(cbuf14) instanceof Uint8ClampedArray).toBe(true);
  });

  it('has a default padding size set to 16 bytes', function () {
    expect(pkcs7.pad(str14).length).toBe(16);
    expect(pkcs7.pad(str21).length).toBe(32);
    expect(pkcs7.pad(buf14).byteLength).toBe(16);
    expect(pkcs7.pad(buf21).byteLength).toBe(32);
  });

  it('accepts a custom size should modify the block size', function () {
    expect(pkcs7.pad(str14, 20).length).toBe(20);
    expect(pkcs7.pad(str21, 20).length).toBe(40);
    expect(pkcs7.pad(buf14, 20).byteLength).toBe(20);
    expect(pkcs7.pad(buf21, 20).byteLength).toBe(40);
  });

  it('should not override the existing data', function () {
    expect(pkcs7.pad(str14).substring(0, 14)).toBe(str14);
    var padded = pkcs7.pad(buf14);
    for (var i = 0; i < 14; i++) expect(padded[i]).toBe(0);
  });

  it('writes bytes that are the length of the padding itself', function () {
    var padded = pkcs7.pad(str14);
    for (var i = 14; i < 16; i++) expect(padded.charCodeAt(i)).toBe(2);
    padded = pkcs7.pad(str21, 32);
    for (i = 21; i < 32; i++) expect(padded.charCodeAt(i)).toBe(11);

    padded = pkcs7.pad(buf14);
    for (i = 14; i < 16; i++) expect(padded[i]).toBe(2);
    padded = pkcs7.pad(buf21, 32);
    for (i = 21; i < 32; i++) expect(padded[i]).toBe(11);
  });

  it('should not do anything with a block size of 0 bytes', function () {
    expect(pkcs7.pad(str21, 0)).toBe(str21);
    expect(pkcs7.pad(buf21, 0)).toEqual(buf21);
  });
});

describe('The unpad() function', function () {
  var pStr14 = pkcs7.pad(str14);
  var pStr21 = pkcs7.pad(str21);
  var sStr21 = pkcs7.pad(str21, 20);
  var pBuf14 = pkcs7.pad(buf14);
  var pBuf21 = pkcs7.pad(buf21);
  var sBuf21 = pkcs7.pad(buf21, 20);
  var pCbuf14 = pkcs7.pad(cbuf14);
  var pCbuf21 = pkcs7.pad(cbuf21);
  var sCbuf21 = pkcs7.pad(cbuf21, 20);

  it('can be called on either a string of a buffer', function () {
    expect(typeof pkcs7.unpad(pStr14) === 'string').toBe(true);
    expect(pkcs7.unpad(pBuf14) instanceof Uint8Array).toBe(true);
    expect(pkcs7.unpad(pCbuf14) instanceof Uint8ClampedArray).toBe(true);
  });

  it('should remove the padding', function () {
    expect(pkcs7.unpad(pStr21)).toBe(str21);
    expect(pkcs7.unpad(pBuf21)).toEqual(buf21);
    expect(pkcs7.unpad(pCbuf21)).toEqual(cbuf21);
  });

  it('should be able to remove paddings of custom sizes', function () {
    expect(pkcs7.unpad(sStr21)).toBe(str21);
    expect(pkcs7.unpad(sBuf21)).toEqual(buf21);
    expect(pkcs7.unpad(sCbuf21)).toEqual(cbuf21);
  });

  it('should throw an error if the padding length is too big', function () {
    var iStr21 = pStr21.substring(0, 31) + String.fromCharCode(60);
    expect(function () { pkcs7.unpad(iStr21); }).toThrow(new Error('unpad(): cannot remove 60' +
      ' bytes from a 32-byte(s) string'));

    var iBuf21 = pBuf21.slice(0, 32);
    iBuf21[31] = 60;
    expect(function () { pkcs7.unpad(iBuf21); }).toThrow(new Error('unpad(): cannot remove 60' +
      ' bytes from a 32-byte(s) string'));
  });

  it('should throw an error if the padding content is not constant', function () {
    var iStr21 = pStr21.substring(0, 27) + String.fromCharCode(0) + pStr21.substring(28, 32);
    expect(function () { pkcs7.unpad(iStr21); }).toThrow(new Error('unpad(): found a padding byte' +
      ' of 0 instead of 11 at position 27'));

    var iBuf21 = pBuf21.slice(0, 32);
    iBuf21[27] = 0;
    expect(function () { pkcs7.unpad(iStr21); }).toThrow(new Error('unpad(): found a padding byte' +
      ' of 0 instead of 11 at position 27'));
  });
});
