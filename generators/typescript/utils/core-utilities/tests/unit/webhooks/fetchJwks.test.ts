import { fetchJwks } from "../../../src/core/webhooks/fetchJwks";

// Minimal RSA JWK with n/e (base64url-encoded)
const RSA_JWK = {
    kty: "RSA",
    kid: "rsa-key-1",
    n: "sIwr3J3hRDSHHhA0qgTqiNjKKSZnHbWIGdTfmHOk6hTXW7zfCsGxhlEgZFgKNs1Zr0b9kzAnHyxzIYgKPwtL8SiSVeV6kBV5L8YMQJ3FNAfMWvJ5bEJhWmC8z2u5pQ9-3Fk9yUiVW4Ee7LkA1OdSHTCF6vl8_Ag0YULHG2d8",
    e: "AQAB",
};

const X5C_VALUE =
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsIwr3J3hRDSHHhA0qgTqiNjKKSZnHbWIGdTfmHOk6hTXW7zfCsGxhlEgZFgKNs1Zr0b9kzAnHyxzIYgKPwtL8SiSVeV6kBV5L8YMQJ3FNAfMWvJ5bEJhWmC8z2u5pQ9";

// Use a unique URL per test to avoid cache hits from previous tests
let urlCounter = 0;
function uniqueUrl(): string {
    return `https://example.com/.well-known/jwks-${urlCounter++}.json`;
}

function mockFetch(keys: unknown[]): void {
    vi.stubGlobal(
        "fetch",
        vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ keys }),
        }),
    );
}

afterEach(() => {
    vi.unstubAllGlobals();
});

describe("fetchJwks", () => {
    it("returns PEM for an RSA key selected by kid", async () => {
        mockFetch([RSA_JWK]);
        const pem = await fetchJwks({ url: uniqueUrl(), keyId: "rsa-key-1" });
        expect(pem).toContain("-----BEGIN PUBLIC KEY-----");
        expect(pem).toContain("-----END PUBLIC KEY-----");
    });

    it("returns PEM for the first key when no keyId is specified", async () => {
        mockFetch([RSA_JWK]);
        const pem = await fetchJwks({ url: uniqueUrl() });
        expect(pem).toContain("-----BEGIN PUBLIC KEY-----");
    });

    it("returns a certificate PEM for a key with x5c", async () => {
        const jwkWithX5c = { kty: "RSA", kid: "x5c-key", x5c: [X5C_VALUE] };
        mockFetch([jwkWithX5c]);
        const pem = await fetchJwks({ url: uniqueUrl(), keyId: "x5c-key" });
        expect(pem).toBe(`-----BEGIN CERTIFICATE-----\n${X5C_VALUE}\n-----END CERTIFICATE-----`);
    });

    it("throws when no key matches the requested kid", async () => {
        mockFetch([RSA_JWK]);
        await expect(fetchJwks({ url: uniqueUrl(), keyId: "missing-kid" })).rejects.toThrow(
            'No key found with kid "missing-kid"',
        );
    });

    it("throws when the JWKS response contains no keys", async () => {
        mockFetch([]);
        await expect(fetchJwks({ url: uniqueUrl() })).rejects.toThrow("No keys found in JWKS");
    });

    it("throws when fetch returns a non-ok response", async () => {
        vi.stubGlobal(
            "fetch",
            vi.fn().mockResolvedValue({
                ok: false,
                status: 403,
                statusText: "Forbidden",
            }),
        );
        await expect(fetchJwks({ url: uniqueUrl() })).rejects.toThrow("Failed to fetch JWKS");
    });

    it("throws for EC keys (unsupported PEM conversion)", async () => {
        const ecJwk = { kty: "EC", kid: "ec-key-1", crv: "P-256", x: "abc", y: "def" };
        mockFetch([ecJwk]);
        await expect(fetchJwks({ url: uniqueUrl(), keyId: "ec-key-1" })).rejects.toThrow(
            "Unsupported JWK key type for PEM conversion: EC",
        );
    });

    it("throws for OKP keys (unsupported PEM conversion)", async () => {
        const okpJwk = { kty: "OKP", kid: "okp-key-1", crv: "Ed25519", x: "abc" };
        mockFetch([okpJwk]);
        await expect(fetchJwks({ url: uniqueUrl(), keyId: "okp-key-1" })).rejects.toThrow(
            "Unsupported JWK key type for PEM conversion: OKP",
        );
    });

    it("serves a cached response on the second call without re-fetching", async () => {
        const fetchMock = vi.fn().mockResolvedValue({
            ok: true,
            json: () => Promise.resolve({ keys: [RSA_JWK] }),
        });
        vi.stubGlobal("fetch", fetchMock);
        const url = uniqueUrl();

        await fetchJwks({ url });
        await fetchJwks({ url });

        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("re-fetches after a cache miss on kid and succeeds on retry", async () => {
        const RSA_JWK_2 = { ...RSA_JWK, kid: "rsa-key-2" };
        const fetchMock = vi
            .fn()
            // First call: key not present yet
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ keys: [RSA_JWK] }),
            })
            // Second call (cache-busted retry): key now present
            .mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ keys: [RSA_JWK, RSA_JWK_2] }),
            });
        vi.stubGlobal("fetch", fetchMock);
        const url = uniqueUrl();

        const pem = await fetchJwks({ url, keyId: "rsa-key-2" });

        expect(fetchMock).toHaveBeenCalledTimes(2);
        expect(pem).toContain("-----BEGIN PUBLIC KEY-----");
    });

    it("throws for an RSA key missing n/e fields and no x5c", async () => {
        const incompleteRsaJwk = { kty: "RSA", kid: "incomplete-rsa" };
        mockFetch([incompleteRsaJwk]);
        await expect(fetchJwks({ url: uniqueUrl(), keyId: "incomplete-rsa" })).rejects.toThrow(
            "Unsupported JWK key type for PEM conversion: RSA",
        );
    });
});
