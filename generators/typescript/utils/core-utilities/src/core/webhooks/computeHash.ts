import { RUNTIME } from "../runtime";
import type { SignatureEncoding } from "./types";

export const HASH_ALGORITHM_TO_SUBTLE_NAME = {
    sha1: "SHA-1",
    sha256: "SHA-256",
    sha384: "SHA-384",
    sha512: "SHA-512"
} as const;

export type HashAlgorithm = keyof typeof HASH_ALGORITHM_TO_SUBTLE_NAME;

export interface ComputeHashArgs {
    payload: string;
    algorithm: HashAlgorithm;
    encoding: SignatureEncoding;
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
    const digest = await subtle.digest(HASH_ALGORITHM_TO_SUBTLE_NAME[args.algorithm], enc.encode(args.payload));
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
