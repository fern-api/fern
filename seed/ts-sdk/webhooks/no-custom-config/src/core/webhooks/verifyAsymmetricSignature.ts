import type { SignatureEncoding } from "./types.js";

export type AsymmetricAlgorithm =
    | "RSA_SHA256"
    | "RSA_SHA384"
    | "RSA_SHA512"
    | "ECDSA_SHA256"
    | "ECDSA_SHA384"
    | "ECDSA_SHA512"
    | "ED25519";

export interface VerifyAsymmetricSignatureArgs {
    payload: string;
    signature: string;
    publicKey: string;
    algorithm: AsymmetricAlgorithm;
    encoding: SignatureEncoding;
}

function decodeSignature(signature: string, encoding: SignatureEncoding): Uint8Array {
    if (encoding === "base64") {
        if (typeof Buffer !== "undefined") {
            return new Uint8Array(Buffer.from(signature, "base64"));
        }
        const binString = atob(signature);
        return Uint8Array.from(binString, (m) => m.codePointAt(0)!);
    }
    // hex
    const bytes = new Uint8Array(signature.length / 2);
    for (let i = 0; i < signature.length; i += 2) {
        bytes[i / 2] = parseInt(signature.substring(i, i + 2), 16);
    }
    return bytes;
}

interface NodeAlgorithmConfig {
    algorithmName: string;
    isEd25519: boolean;
}

function getNodeAlgorithmConfig(algorithm: AsymmetricAlgorithm): NodeAlgorithmConfig {
    switch (algorithm) {
        case "RSA_SHA256":
            return { algorithmName: "RSA-SHA256", isEd25519: false };
        case "RSA_SHA384":
            return { algorithmName: "RSA-SHA384", isEd25519: false };
        case "RSA_SHA512":
            return { algorithmName: "RSA-SHA512", isEd25519: false };
        case "ECDSA_SHA256":
            return { algorithmName: "SHA256", isEd25519: false };
        case "ECDSA_SHA384":
            return { algorithmName: "SHA384", isEd25519: false };
        case "ECDSA_SHA512":
            return { algorithmName: "SHA512", isEd25519: false };
        case "ED25519":
            return { algorithmName: "ed25519", isEd25519: true };
    }
}

async function verifyWithNode(args: VerifyAsymmetricSignatureArgs): Promise<boolean> {
    const crypto = await import("crypto");
    const signatureBytes = decodeSignature(args.signature, args.encoding);
    const config = getNodeAlgorithmConfig(args.algorithm);

    if (config.isEd25519) {
        return crypto.verify(null, Buffer.from(args.payload), args.publicKey, signatureBytes);
    }

    const verifier = crypto.createVerify(config.algorithmName);
    verifier.update(args.payload);
    return verifier.verify(args.publicKey, signatureBytes);
}

interface SubtleAlgorithmDescriptor {
    name: string;
    hash?: string;
    namedCurve?: string;
}

function getSubtleAlgorithmDescriptor(algorithm: AsymmetricAlgorithm): SubtleAlgorithmDescriptor {
    switch (algorithm) {
        case "RSA_SHA256":
            return { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" };
        case "RSA_SHA384":
            return { name: "RSASSA-PKCS1-v1_5", hash: "SHA-384" };
        case "RSA_SHA512":
            return { name: "RSASSA-PKCS1-v1_5", hash: "SHA-512" };
        case "ECDSA_SHA256":
            return { name: "ECDSA", hash: "SHA-256", namedCurve: "P-256" };
        case "ECDSA_SHA384":
            return { name: "ECDSA", hash: "SHA-384", namedCurve: "P-384" };
        case "ECDSA_SHA512":
            return { name: "ECDSA", hash: "SHA-512", namedCurve: "P-521" };
        case "ED25519":
            return { name: "Ed25519" };
    }
}

function pemToArrayBuffer(pem: string): ArrayBuffer {
    const lines = pem.split("\n").filter((line) => !line.startsWith("-----"));
    const base64 = lines.join("");
    if (typeof Buffer !== "undefined") {
        const buffer = Buffer.from(base64, "base64");
        return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
    }
    const binString = atob(base64);
    const bytes = new Uint8Array(binString.length);
    for (let i = 0; i < binString.length; i++) {
        bytes[i] = binString.charCodeAt(i);
    }
    return bytes.buffer;
}

function getImportAlgorithm(
    descriptor: SubtleAlgorithmDescriptor,
): AlgorithmIdentifier | RsaHashedImportParams | EcKeyImportParams {
    if (descriptor.namedCurve != null) {
        return { name: descriptor.name, namedCurve: descriptor.namedCurve };
    }
    if (descriptor.hash != null) {
        return { name: descriptor.name, hash: descriptor.hash };
    }
    return { name: descriptor.name };
}

function getVerifyAlgorithm(descriptor: SubtleAlgorithmDescriptor): AlgorithmIdentifier | EcdsaParams {
    if (descriptor.name === "ECDSA" && descriptor.hash != null) {
        return { name: descriptor.name, hash: { name: descriptor.hash } };
    }
    return { name: descriptor.name };
}

async function verifyWithSubtleCrypto(args: VerifyAsymmetricSignatureArgs): Promise<boolean> {
    const encoder = new TextEncoder();
    const signatureBytes = decodeSignature(args.signature, args.encoding);
    const descriptor = getSubtleAlgorithmDescriptor(args.algorithm);
    const keyData = pemToArrayBuffer(args.publicKey);

    const key = await globalThis.crypto.subtle.importKey("spki", keyData, getImportAlgorithm(descriptor), false, [
        "verify",
    ]);

    return globalThis.crypto.subtle.verify(
        getVerifyAlgorithm(descriptor),
        key,
        signatureBytes,
        encoder.encode(args.payload),
    );
}

export async function verifyAsymmetricSignature(args: VerifyAsymmetricSignatureArgs): Promise<boolean> {
    if (typeof process !== "undefined" && process.versions?.node) {
        return verifyWithNode(args);
    }
    return verifyWithSubtleCrypto(args);
}
