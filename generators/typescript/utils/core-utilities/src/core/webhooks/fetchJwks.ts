export interface FetchJwksArgs {
    url: string;
    keyId?: string;
}

interface JwksKey {
    kid?: string;
    kty: string;
    n?: string;
    e?: string;
    x?: string;
    y?: string;
    crv?: string;
    x5c?: string[];
    [key: string]: unknown;
}

interface JwksResponse {
    keys: JwksKey[];
}

interface CacheEntry {
    keys: JwksKey[];
    fetchedAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes
const cache = new Map<string, CacheEntry>();

function base64UrlToBase64(base64url: string): string {
    let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4 !== 0) {
        base64 += "=";
    }
    return base64;
}

function jwkToPem(jwk: JwksKey): string {
    if (jwk.x5c != null && jwk.x5c.length > 0) {
        const cert = jwk.x5c[0]!;
        return `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----`;
    }

    // For RSA keys, construct the PEM from n and e
    if (jwk.kty === "RSA" && jwk.n != null && jwk.e != null) {
        return constructRsaPem(jwk.n, jwk.e);
    }

    // For EC/OKP keys, fall back to returning the raw JWK as a JSON string
    // The caller should handle this appropriately
    throw new Error(`Unsupported JWK key type for PEM conversion: ${jwk.kty}`);
}

function constructRsaPem(nBase64Url: string, eBase64Url: string): string {
    const nBytes = base64UrlDecode(nBase64Url);
    const eBytes = base64UrlDecode(eBase64Url);

    // ASN.1 DER encoding of RSA public key
    const nEncoded = asn1Integer(nBytes);
    const eEncoded = asn1Integer(eBytes);
    const sequence = asn1Sequence(new Uint8Array([...nEncoded, ...eEncoded]));
    const bitString = asn1BitString(sequence);
    const algorithmIdentifier = asn1Sequence(
        new Uint8Array([
            // OID for rsaEncryption (1.2.840.113549.1.1.1)
            0x06, 0x09, 0x2a, 0x86, 0x48, 0x86, 0xf7, 0x0d, 0x01, 0x01, 0x01,
            // NULL
            0x05, 0x00
        ])
    );
    const spki = asn1Sequence(new Uint8Array([...algorithmIdentifier, ...bitString]));

    const base64 = uint8ArrayToBase64(spki);
    const lines: string[] = [];
    for (let i = 0; i < base64.length; i += 64) {
        lines.push(base64.substring(i, i + 64));
    }
    return `-----BEGIN PUBLIC KEY-----\n${lines.join("\n")}\n-----END PUBLIC KEY-----`;
}

function base64UrlDecode(input: string): Uint8Array {
    const base64 = base64UrlToBase64(input);
    if (typeof Buffer !== "undefined") {
        return new Uint8Array(Buffer.from(base64, "base64"));
    }
    const binString = atob(base64);
    return Uint8Array.from(binString, (c) => c.charCodeAt(0));
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
    if (typeof Buffer !== "undefined") {
        return Buffer.from(bytes).toString("base64");
    }
    const binString = String.fromCodePoint(...bytes);
    return btoa(binString);
}

function asn1Length(length: number): Uint8Array {
    if (length < 0x80) {
        return new Uint8Array([length]);
    }
    const bytes: number[] = [];
    let temp = length;
    while (temp > 0) {
        bytes.unshift(temp & 0xff);
        temp >>= 8;
    }
    return new Uint8Array([0x80 | bytes.length, ...bytes]);
}

function asn1Integer(bytes: Uint8Array): Uint8Array {
    // Add leading zero if high bit is set (to ensure positive integer)
    const needsPadding = bytes[0]! >= 0x80;
    const content = needsPadding ? new Uint8Array([0, ...bytes]) : bytes;
    const lengthBytes = asn1Length(content.length);
    return new Uint8Array([0x02, ...lengthBytes, ...content]);
}

function asn1Sequence(content: Uint8Array): Uint8Array {
    const lengthBytes = asn1Length(content.length);
    return new Uint8Array([0x30, ...lengthBytes, ...content]);
}

function asn1BitString(content: Uint8Array): Uint8Array {
    // Prepend a zero byte for unused bits
    const lengthBytes = asn1Length(content.length + 1);
    return new Uint8Array([0x03, ...lengthBytes, 0x00, ...content]);
}

async function fetchKeys(url: string): Promise<JwksKey[]> {
    const cached = cache.get(url);
    if (cached != null && Date.now() - cached.fetchedAt < CACHE_TTL_MS) {
        return cached.keys;
    }

    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch JWKS from ${url}: ${response.status} ${response.statusText}`);
    }

    const jwks = (await response.json()) as JwksResponse;
    cache.set(url, { keys: jwks.keys, fetchedAt: Date.now() });
    return jwks.keys;
}

export async function fetchJwks(args: FetchJwksArgs): Promise<string> {
    const keys = await fetchKeys(args.url);

    let selectedKey: JwksKey | undefined;
    if (args.keyId != null) {
        selectedKey = keys.find((k) => k.kid === args.keyId);
        if (selectedKey == null) {
            // Invalidate cache and retry once
            cache.delete(args.url);
            const refreshedKeys = await fetchKeys(args.url);
            selectedKey = refreshedKeys.find((k) => k.kid === args.keyId);
        }
    } else {
        selectedKey = keys[0];
    }

    if (selectedKey == null) {
        throw new Error(
            args.keyId != null
                ? `No key found with kid "${args.keyId}" in JWKS at ${args.url}`
                : `No keys found in JWKS at ${args.url}`
        );
    }

    return jwkToPem(selectedKey);
}
