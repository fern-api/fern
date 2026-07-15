import { RUNTIME } from "../runtime";
import type { SignatureEncoding } from "./types";

export type HashAlgorithm = "sha256" | "sha1" | "sha384" | "sha512";

export interface ComputeHashArgs {
    payload: string;
    algorithm: HashAlgorithm;
    encoding: SignatureEncoding;
}

function hashAlgorithmToSubtleName(algorithm: HashAlgorithm): string {
    switch (algorithm) {
        case "sha1":
            return "SHA-1";
        case "sha256":
            return "SHA-256";
        case "sha384":
            return "SHA-384";
        case "sha512":
            return "SHA-512";
    }
}

/**
 * Compute a digest of the raw request body. Unlike computeHmacSignature this is an
 * unkeyed hash, used by providers that transmit a hash of the raw body separately
 * (e.g. Twilio's bodySHA256 query parameter) rather than signing the body directly.
 */
export async function computeHash(args: ComputeHashArgs): Promise<string> {
    if (RUNTIME.type === "node") {
        const crypto = await import("crypto");
        const hash = crypto.createHash(args.algorithm);
        hash.update(args.payload);
        return hash.digest(args.encoding);
    }

    const subtle = globalThis.crypto.subtle;
    const enc = new TextEncoder();
    const digest = await subtle.digest(hashAlgorithmToSubtleName(args.algorithm), enc.encode(args.payload));
    const bytes = new Uint8Array(digest);
    if (args.encoding === "hex") {
        return Array.from(bytes)
            .map((b) => b.toString(16).padStart(2, "0"))
            .join("");
    }
    // base64
    let binary = "";
    for (const byte of bytes) {
        binary += String.fromCharCode(byte);
    }
    return btoa(binary);
}
