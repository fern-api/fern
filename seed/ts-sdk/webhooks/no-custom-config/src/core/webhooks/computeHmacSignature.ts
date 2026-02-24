import type { SignatureEncoding } from "./types.js";

export type HmacAlgorithm = "sha256" | "sha1" | "sha384" | "sha512";

export interface ComputeHmacSignatureArgs {
    payload: string;
    secret: string;
    algorithm: HmacAlgorithm;
    encoding: SignatureEncoding;
}

const SUBTLE_ALGORITHM_MAP: Record<HmacAlgorithm, string> = {
    sha256: "SHA-256",
    sha1: "SHA-1",
    sha384: "SHA-384",
    sha512: "SHA-512",
};

function hexEncode(buffer: ArrayBuffer): string {
    return Array.from(new Uint8Array(buffer))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
}

function base64Encode(buffer: ArrayBuffer): string {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(buffer).toString("base64");
    }
    const bytes = new Uint8Array(buffer);
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

function encodeResult(buffer: ArrayBuffer, encoding: SignatureEncoding): string {
    return encoding === "hex" ? hexEncode(buffer) : base64Encode(buffer);
}

async function computeWithNode(args: ComputeHmacSignatureArgs): Promise<string> {
    const crypto = await import("crypto");
    const hmac = crypto.createHmac(args.algorithm, args.secret);
    hmac.update(args.payload);
    return hmac.digest(args.encoding);
}

async function computeWithSubtleCrypto(args: ComputeHmacSignatureArgs): Promise<string> {
    const subtleAlgorithm = SUBTLE_ALGORITHM_MAP[args.algorithm];
    const encoder = new TextEncoder();
    const key = await globalThis.crypto.subtle.importKey(
        "raw",
        encoder.encode(args.secret),
        { name: "HMAC", hash: subtleAlgorithm },
        false,
        ["sign"],
    );
    const signature = await globalThis.crypto.subtle.sign("HMAC", key, encoder.encode(args.payload));
    return encodeResult(signature, args.encoding);
}

export async function computeHmacSignature(args: ComputeHmacSignatureArgs): Promise<string> {
    if (typeof process !== "undefined" && process.versions?.node) {
        return computeWithNode(args);
    }
    return computeWithSubtleCrypto(args);
}
