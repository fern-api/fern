import { describe, expect, it } from "vitest";

import { getProxyUriForOrigin, readProxyEnvironment } from "../proxy.js";

describe("readProxyEnvironment", () => {
    it("accepts lower- and upper-case spellings, preferring lower-case", () => {
        expect(
            readProxyEnvironment({
                https_proxy: "http://lower:3128",
                HTTPS_PROXY: "http://upper:3128",
                HTTP_PROXY: "http://plain:3128",
                NO_PROXY: "internal.example.com"
            })
        ).toEqual({
            httpProxy: "http://plain:3128",
            httpsProxy: "http://lower:3128",
            noProxy: "internal.example.com"
        });
    });

    it("treats empty values as unset", () => {
        expect(readProxyEnvironment({ HTTPS_PROXY: "", HTTP_PROXY: "http://proxy:3128" })).toEqual({
            httpProxy: "http://proxy:3128",
            httpsProxy: undefined,
            noProxy: undefined
        });
    });
});

describe("getProxyUriForOrigin", () => {
    const env = { httpProxy: "http://http-proxy:3128", httpsProxy: "http://https-proxy:3128", noProxy: undefined };

    it("uses the https proxy for https origins and the http proxy for http origins", () => {
        expect(getProxyUriForOrigin("https://registry.npmjs.org", env)).toBe("http://https-proxy:3128");
        expect(getProxyUriForOrigin("http://example.com", env)).toBe("http://http-proxy:3128");
    });

    it("falls back to the http proxy for https origins when no https proxy is set", () => {
        expect(getProxyUriForOrigin("https://registry.npmjs.org", { ...env, httpsProxy: undefined })).toBe(
            "http://http-proxy:3128"
        );
    });

    it("does not proxy http origins when only an https proxy is set", () => {
        expect(getProxyUriForOrigin("http://example.com", { ...env, httpProxy: undefined })).toBeUndefined();
    });

    it("never proxies loopback origins", () => {
        expect(getProxyUriForOrigin("http://localhost:4321", env)).toBeUndefined();
        expect(getProxyUriForOrigin("http://127.0.0.1:3000", env)).toBeUndefined();
        expect(getProxyUriForOrigin("http://[::1]:3000", env)).toBeUndefined();
    });

    it("honors no_proxy exact, suffix and wildcard entries", () => {
        const noProxy = "internal.example.com, .corp.net *.svc:8443";
        expect(getProxyUriForOrigin("https://internal.example.com", { ...env, noProxy })).toBeUndefined();
        expect(getProxyUriForOrigin("https://api.internal.example.com", { ...env, noProxy })).toBeUndefined();
        expect(getProxyUriForOrigin("https://docs.corp.net", { ...env, noProxy })).toBeUndefined();
        expect(getProxyUriForOrigin("https://a.svc:8443", { ...env, noProxy })).toBeUndefined();
        expect(getProxyUriForOrigin("https://a.svc", { ...env, noProxy })).toBe("http://https-proxy:3128");
        expect(getProxyUriForOrigin("https://example.com", { ...env, noProxy })).toBe("http://https-proxy:3128");
    });

    it("disables proxying entirely for no_proxy=*", () => {
        expect(getProxyUriForOrigin("https://registry.npmjs.org", { ...env, noProxy: "*" })).toBeUndefined();
    });
});
