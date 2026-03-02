import { RUNTIME } from "../runtime";
import { SignatureEncoding } from "./types";

export type HmacAlgorithm = "sha256" | "sha1" | "sha384" | "sha512";

export interface ComputeHmacSignatureArgs {
    payload: string;
    secret: string;
    algorithm: HmacAlgorithm;
    encoding: SignatureEncoding;
}

function hmacAlgorithmToSubtleName(algorithm: HmacAlgorithm): string {
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

export async function computeHmacSignature(args: ComputeHmacSignatureArgs): Promise<string> {
    if (RUNTIME.type === "node") {
        const crypto = await import("crypto");
        const hmac = crypto.createHmac(args.algorithm, args.secret);
        hmac.update(args.payload);
        return hmac.digest(args.encoding);
    }

    const subtle = globalThis.crypto.subtle;
    const enc = new TextEncoder();
    const keyMaterial = await subtle.importKey(
        "raw",
        enc.encode(args.secret),
        { name: "HMAC", hash: hmacAlgorithmToSubtleName(args.algorithm) },
        false,
        ["sign"]
    );
    const signatureBuffer = await subtle.sign("HMAC", keyMaterial, enc.encode(args.payload));
    const bytes = new Uint8Array(signatureBuffer);
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
