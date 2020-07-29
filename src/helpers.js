import CBOR from 'cbor';

export function ab2str(buf) {
	return String.fromCharCode.apply(null, new Uint8Array(buf));
}

export function ab2b64(buf) {
	return btoa(ab2str(buf));
}

export function ab2json(buf) {
	return JSON.parse(ab2str(buf));
}

export function ab2hex(buf) {
	return Array.prototype.map
		.call(new Uint8Array(buf), x => ('00' + x.toString(16)).slice(-2))
		.join('');
}

export function cbor2json(buf) {
	return CBOR.decode(ab2hex(buf));
}

export function decodeCredential(savedCred) {
	return {
		...savedCred,
		rawId: ab2hex(savedCred.rawId),
		response: {
			...savedCred.response,
			// It is CBOR object but it's not really that useful to see it
			// attestationObjectCbor: cbor2json(savedCred.response.attestationObject),
			attestationObjectHex: ab2hex(savedCred.response.attestationObject),
			clientDataJSON: ab2json(savedCred.response.clientDataJSON),
		},
	};
}

export function decodeAssertion(assertion) {
	return {
		...assertion,
		rawId: ab2hex(assertion.rawId),
		response: {
			...assertion.response,
			authenticatorDataHex: ab2hex(assertion.response.authenticatorData),
			clientDataJSON: ab2json(assertion.response.clientDataJSON),
			signatureHex: ab2hex(assertion.response.signature),
		},
	};
}

// Don't do this in production, generate something sutably random on the server
export function generateId() {
	const ab = new 
	Uint8Array(16);

	for (let i = 0; i < 16; i++) {
		ab[i] = Math.round(Math.random() * 255);
	}

	return ab;
}

// Don't do this in production, generate something cryptographically safe on the server
export function generateChallenge() {
	const ab = new Uint8Array(32);

	for (let i = 0; i < 32; i++) {
		ab[i] = Math.round(Math.random() * 255);
	}

	return ab.buffer;
}
