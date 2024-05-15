// biome-ignore lint/style/useNodejsImportProtocol: webpack error on node:crypto
import * as crypto_backend from "crypto";

const crypto =
	typeof window === "undefined" ? crypto_backend.subtle : window.crypto.subtle;

export async function generateAsymmetricalKeyPair(): Promise<CryptoKeyPair> {
	const algorithm: RsaHashedKeyGenParams = {
		name: "RSA-OAEP",
		modulusLength: 4096,
		publicExponent: new Uint8Array([1, 0, 1]),
		hash: "SHA-256",
	};
	const keyPair = await crypto.generateKey(algorithm, true, [
		"encrypt",
		"decrypt",
	]);
	await storeKeyPair(keyPair);
	return keyPair;
}

export async function storeKeyPair(
	keyPair: CryptoKeyPair,
): Promise<CryptoKeyPair> {
	const publicKey = await crypto.exportKey("jwk", keyPair.publicKey);
	const privateKey = await crypto.exportKey("jwk", keyPair.privateKey);

	localStorage.setItem("publicKey", JSON.stringify(publicKey));
	localStorage.setItem("privateKey", JSON.stringify(privateKey));

	return keyPair;
}

export async function loadKeyPair(): Promise<CryptoKeyPair | null> {
	const publicKeyString = localStorage.getItem("publicKey");
	const privateKeyString = localStorage.getItem("privateKey");

	if (!publicKeyString || !privateKeyString) {
		return null;
	}

	const publicKey = await crypto.importKey(
		"jwk",
		JSON.parse(publicKeyString) as JsonWebKey,
		{ name: "RSA-OAEP", hash: "SHA-256" },
		true,
		["encrypt"],
	);
	const privateKey = await crypto.importKey(
		"jwk",
		JSON.parse(privateKeyString) as JsonWebKey,
		{ name: "RSA-OAEP", hash: "SHA-256" },
		true,
		["decrypt"],
	);
	return { publicKey, privateKey };
}

export async function exportAsymmetricalKey(key: CryptoKey): Promise<string> {
	const exportedKey = await crypto.exportKey("jwk", key);
	return JSON.stringify(exportedKey);
}

export async function importRsaPublicKey(
	publicKey: string,
): Promise<CryptoKey> {
	return await crypto.importKey(
		"jwk",
		JSON.parse(publicKey) as JsonWebKey,
		{ name: "RSA-OAEP", hash: "SHA-256" },
		true,
		["encrypt"],
	);
}

export async function encrypt(
	key: CryptoKey,
	data: string,
	iv: Uint8Array = new Uint8Array(12),
): Promise<string> {
	const encoded = new TextEncoder().encode(data);
	const encrypted = await crypto.encrypt(
		{
			name: key.algorithm.name,
			iv,
		},
		key,
		encoded,
	);
	return Buffer.from(encrypted).toString("hex");
}

export async function decrypt(
	key: CryptoKey,
	data: ArrayBuffer,
	iv: Uint8Array = new Uint8Array(12),
): Promise<string> {
	const decrypted = await crypto.decrypt(
		{
			name: key.algorithm.name,
			iv,
		},
		key,
		data,
	);
	return new TextDecoder().decode(decrypted);
}

export function clearKeyPair() {
	localStorage.removeItem("publicKey");
	localStorage.removeItem("privateKey");
}

export async function generateSymmetricalKey(): Promise<CryptoKey> {
	return await crypto.generateKey({ name: "AES-GCM", length: 256 }, true, [
		"encrypt",
		"decrypt",
	]);
}

export async function exportSymmetricalKey(key: CryptoKey): Promise<string> {
	return JSON.stringify(await crypto.exportKey("jwk", key));
}

export async function importSymmetricalKey(key: string): Promise<CryptoKey> {
	return await crypto.importKey(
		"jwk",
		JSON.parse(key) as JsonWebKey,
		{ name: "AES-GCM" },
		true,
		["encrypt", "decrypt"],
	);
}

export async function encryptFileSymmetrical(
	file: File,
	key: CryptoKey,
): Promise<ArrayBuffer> {
	const fileBuffer = await file.arrayBuffer();
	return await crypto.encrypt(
		{ name: "AES-GCM", iv: new Uint8Array(12) },
		key,
		fileBuffer,
	);
}

export async function decryptFileSymmetrical(
	file: ArrayBuffer,
	key: CryptoKey,
): Promise<ArrayBuffer> {
	return await crypto.decrypt(
		{ name: "AES-GCM", iv: new Uint8Array(12) },
		key,
		file,
	);
}

export async function encryptFormValue(
	value: string,
	key: CryptoKey,
	iv: Uint8Array,
) {
	const ivString = Array.from(iv)
		.map((b) => String.fromCharCode(b))
		.join("");
	const encryptedValue = await encrypt(key, value, iv);

	return btoa(`${ivString}${encryptedValue}`);
}

export async function decryptFormValue(value: string, key: CryptoKey) {
	const decoded = atob(value);
	const ivString = decoded.slice(0, 12);
	const encryptedValue = decoded.slice(12);
	const iv = Array.from(ivString).map((c) => c.charCodeAt(0));

	return decrypt(key, Buffer.from(encryptedValue, "hex"), new Uint8Array(iv));
}
