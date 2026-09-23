import type { LookupAddress } from "node:dns";
import { lookup as dnsLookup } from "node:dns/promises";
import type { IncomingHttpHeaders } from "node:http";
import { request as httpRequest } from "node:http";
import { request as httpsRequest } from "node:https";
import { isIP, type LookupFunction } from "node:net";

const MAX_REDIRECTS = 5;
const MAX_RESPONSE_BYTES = 25 * 1024 * 1024;
const REQUEST_TIMEOUT_MS = 30_000;

export interface RemoteTextResource {
    body: string;
    mimeType?: string;
}

interface RemoteResponse {
    statusCode: number;
    headers: IncomingHttpHeaders;
    body: Buffer;
}

interface SafeFetchOptions {
    lookup?: typeof dnsLookup;
    request?: (url: URL, addresses: LookupAddress[]) => Promise<RemoteResponse>;
}

/** Fetches a public HTTP(S) resource while validating every redirect and pinning DNS results. */
export async function safeFetchRemoteText(url: string, options: SafeFetchOptions = {}): Promise<RemoteTextResource> {
    const response = await fetchWithRedirects(url, options, 0);
    const contentType = response.headers["content-type"];
    return {
        body: response.body.toString("utf8"),
        ...(typeof contentType === "string" ? { mimeType: contentType } : {})
    };
}

async function fetchWithRedirects(
    value: string,
    options: SafeFetchOptions,
    redirectCount: number
): Promise<RemoteResponse> {
    const { url, addresses } = await validateRemoteUrl(value, options.lookup ?? dnsLookup);
    const response = await (options.request ?? requestPinnedUrl)(url, addresses);
    if (isRedirect(response.statusCode)) {
        if (redirectCount >= MAX_REDIRECTS) {
            throw new Error(`Remote API source exceeded ${MAX_REDIRECTS} redirects`);
        }
        const location = response.headers.location;
        if (typeof location !== "string") {
            throw new Error(`Remote API source returned redirect ${response.statusCode} without a Location header`);
        }
        return fetchWithRedirects(new URL(location, url).href, options, redirectCount + 1);
    }
    if (response.statusCode < 200 || response.statusCode >= 300) {
        throw new Error(`Remote API source returned HTTP ${response.statusCode}`);
    }
    return response;
}

export async function validateRemoteUrl(
    value: string,
    lookup: typeof dnsLookup = dnsLookup
): Promise<{ url: URL; addresses: LookupAddress[] }> {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") {
        throw new Error(`Remote API source must use HTTP or HTTPS: ${value}`);
    }
    if (url.username.length > 0 || url.password.length > 0) {
        throw new Error("Remote API source URLs cannot contain credentials");
    }
    const hostname = url.hostname.replace(/^\[|\]$/g, "").toLowerCase();
    if (hostname === "localhost" || hostname.endsWith(".localhost")) {
        throw new Error(`Remote API source resolves to a blocked host: ${hostname}`);
    }
    const addresses = await lookup(hostname, { all: true, verbatim: true });
    if (addresses.length === 0) {
        throw new Error(`Remote API source host did not resolve: ${hostname}`);
    }
    for (const address of addresses) {
        if (!isPublicIpAddress(address.address)) {
            throw new Error(`Remote API source resolves to a blocked address: ${address.address}`);
        }
    }
    return { url, addresses };
}

export function isPublicIpAddress(address: string): boolean {
    const version = isIP(address);
    if (version === 4) {
        return isPublicIpv4(address);
    }
    if (version === 6) {
        return isPublicIpv6(address);
    }
    return false;
}

function isPublicIpv4(address: string): boolean {
    const octets = address.split(".").map(Number);
    const [first, second, third] = octets;
    if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
        return false;
    }
    if (first == null || second == null || third == null) {
        return false;
    }
    return !(
        first === 0 ||
        first === 10 ||
        (first === 100 && second >= 64 && second <= 127) ||
        first === 127 ||
        (first === 169 && second === 254) ||
        (first === 172 && second >= 16 && second <= 31) ||
        (first === 192 && second === 0 && third === 0) ||
        (first === 192 && second === 0 && third === 2) ||
        (first === 192 && second === 168) ||
        (first === 198 && (second === 18 || second === 19)) ||
        (first === 198 && second === 51 && third === 100) ||
        (first === 203 && second === 0 && third === 113) ||
        first >= 224
    );
}

function isPublicIpv6(address: string): boolean {
    const words = parseIpv6Words(address);
    if (words == null) {
        return false;
    }
    const first = words[0];
    if (first == null) {
        return false;
    }
    const isUnspecifiedOrLoopback = words.slice(0, 7).every((word) => word === 0) && (words[7] === 0 || words[7] === 1);
    const isUniqueLocal = (first & 0xfe00) === 0xfc00;
    const isLinkLocal = (first & 0xffc0) === 0xfe80;
    const isDeprecatedSiteLocal = (first & 0xffc0) === 0xfec0;
    const isMulticast = (first & 0xff00) === 0xff00;
    const isSpecialPurpose = first === 0x2001 && (words[1] ?? 0) <= 0x01ff;
    const isSixToFour = first === 0x2002;
    const isDiscardOnly = first === 0x0100 && words.slice(1, 4).every((word) => word === 0);
    const isIpv4Mapped = words.slice(0, 5).every((word) => word === 0) && (words[5] === 0 || words[5] === 0xffff);
    const isIpv4Translated = words.slice(0, 4).every((word) => word === 0) && words[4] === 0xffff && words[5] === 0;
    const isNat64WellKnown = first === 0x0064 && words[1] === 0xff9b && words.slice(2, 6).every((word) => word === 0);
    const isNat64Local = first === 0x0064 && words[1] === 0xff9b && words[2] === 1;
    if (isIpv4Mapped || isIpv4Translated || isNat64WellKnown) {
        const high = words[6];
        const low = words[7];
        if (high == null || low == null) {
            return false;
        }
        return isPublicIpv4(`${high >> 8}.${high & 0xff}.${low >> 8}.${low & 0xff}`);
    }
    return !(
        isUnspecifiedOrLoopback ||
        isUniqueLocal ||
        isLinkLocal ||
        isDeprecatedSiteLocal ||
        isMulticast ||
        isSpecialPurpose ||
        isSixToFour ||
        isDiscardOnly ||
        isNat64Local
    );
}

function parseIpv6Words(address: string): number[] | undefined {
    const withoutZone = address.toLowerCase().split("%")[0];
    if (withoutZone == null) {
        return undefined;
    }
    let normalized = withoutZone;
    const dottedTail = /(?:^|:)(\d+\.\d+\.\d+\.\d+)$/.exec(normalized)?.[1];
    if (dottedTail != null) {
        const octets = dottedTail.split(".").map(Number);
        if (octets.length !== 4 || octets.some((octet) => !Number.isInteger(octet) || octet < 0 || octet > 255)) {
            return undefined;
        }
        normalized =
            normalized.slice(0, -dottedTail.length) +
            `${(((octets[0] ?? 0) << 8) | (octets[1] ?? 0)).toString(16)}:${(((octets[2] ?? 0) << 8) | (octets[3] ?? 0)).toString(16)}`;
    }
    const halves = normalized.split("::");
    if (halves.length > 2) {
        return undefined;
    }
    const left = halves[0]?.length ? halves[0].split(":") : [];
    const right = halves[1]?.length ? halves[1].split(":") : [];
    const missing = 8 - left.length - right.length;
    if ((halves.length === 1 && missing !== 0) || (halves.length === 2 && missing < 1)) {
        return undefined;
    }
    const groups = [...left, ...Array.from({ length: Math.max(0, missing) }, () => "0"), ...right];
    if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) {
        return undefined;
    }
    return groups.map((group) => Number.parseInt(group, 16));
}

function requestPinnedUrl(url: URL, addresses: LookupAddress[]): Promise<RemoteResponse> {
    return new Promise((resolve, reject) => {
        const transport = url.protocol === "https:" ? httpsRequest : httpRequest;
        const request = transport(
            url,
            {
                method: "GET",
                headers: {
                    accept: "application/json, application/yaml, text/yaml, */*",
                    "user-agent": "fern-cli"
                },
                lookup: createPinnedLookup(addresses),
                signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS)
            },
            (response) => {
                const statusCode = response.statusCode ?? 0;
                if (isRedirect(statusCode)) {
                    response.resume();
                    resolve({ statusCode, headers: response.headers, body: Buffer.alloc(0) });
                    return;
                }
                const contentLength = Number(response.headers["content-length"]);
                if (Number.isFinite(contentLength) && contentLength > MAX_RESPONSE_BYTES) {
                    response.destroy();
                    reject(new Error(`Remote API source exceeds the ${MAX_RESPONSE_BYTES} byte limit`));
                    return;
                }
                const chunks: Buffer[] = [];
                let bytes = 0;
                response.on("data", (chunk: Buffer | string) => {
                    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
                    bytes += buffer.length;
                    if (bytes > MAX_RESPONSE_BYTES) {
                        response.destroy(new Error(`Remote API source exceeds the ${MAX_RESPONSE_BYTES} byte limit`));
                        return;
                    }
                    chunks.push(buffer);
                });
                response.on("end", () => {
                    resolve({ statusCode, headers: response.headers, body: Buffer.concat(chunks) });
                });
                response.on("error", reject);
            }
        );
        request.on("error", reject);
        request.end();
    });
}

function createPinnedLookup(addresses: LookupAddress[]): LookupFunction {
    return (_hostname, options, callback) => {
        if (options.all) {
            callback(null, addresses);
            return;
        }
        const address = addresses[0];
        if (address == null) {
            callback(new Error("Remote API source has no validated address"), "");
            return;
        }
        callback(null, address.address, address.family);
    };
}

function isRedirect(statusCode: number): boolean {
    return statusCode === 301 || statusCode === 302 || statusCode === 303 || statusCode === 307 || statusCode === 308;
}
