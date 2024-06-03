const ethUtil = require('ethereumjs-util');
const assert = require('assert');

// Given a digest (as returned from calling the contract on the DESTINATION chain)
const digest = '0xeb510d4267daf89913a49abc0ed513f177b423ddfdf8d9e53cd44db281ea0936';

// Private key of the AVS
const privateKey = Buffer.from('ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80', 'hex');

// Expected signature
const expectedSignature = '0xb7b7de7819951adf74dc314ee35542fec015e9aaa0927589474cc6298376667209d97c5dd83f88fb107aab4ede92655d352634b3558fca2c4a1e4a1e76735bda1c';

// Convert digest to buffer for signing
const msgHash = Buffer.from(digest.slice(2), 'hex');

// Sign the digest
const signature = ethUtil.ecsign(msgHash, privateKey);

// Convert signature to a single hex string
const signatureHex = ethUtil.toRpcSig(signature.v, signature.r, signature.s);

try {
    assert.strictEqual(signatureHex, expectedSignature);
    console.log('Signature matches the expected signature.');
} catch (error) {
    console.error('Signature does not match the expected signature.');
    console.error('Expected:', expectedSignature);
    console.error('Got:', signatureHex);
}
