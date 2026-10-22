import { TaskContext } from "@fern-api/task-context";
import { describe, expect, it, vi } from "vitest";

import {
    checkCustomDomainsNotOnVercel,
    classifyCustomDomain,
    type DnsLookup,
    VERCEL_DNS_HARD_ERROR_DATE
} from "../vercelDomainCheck.js";

function fakeDns({
    cnames = {},
    a = {}
}: {
    cnames?: Record<string, string>;
    a?: Record<string, string[]>;
}): DnsLookup {
    const notFound = (host: string) => Promise.reject(new Error(`ENODATA ${host}`));
    return {
        resolveCname: (host) => {
            const target = cnames[host];
            return target != null ? Promise.resolve([target]) : notFound(host);
        },
        resolve4: (host) => {
            const ips = a[host];
            return ips != null ? Promise.resolve(ips) : notFound(host);
        }
    };
}

function createFakeContext() {
    const warn = vi.fn();
    const failAndThrow = vi.fn((message?: string) => {
        throw new Error(message ?? "failAndThrow");
    });
    // Test helper: the check only touches logger.warn/debug and failAndThrow.
    const context = { logger: { warn, debug: vi.fn() }, failAndThrow } as unknown as TaskContext;
    return { context, warn, failAndThrow };
}

const BEFORE_CUTOFF = new Date("2026-11-30T23:59:59Z");
const AFTER_CUTOFF = VERCEL_DNS_HARD_ERROR_DATE;

describe("classifyCustomDomain", () => {
    it("detects a CNAME to Fern", async () => {
        const dns = fakeDns({ cnames: { "docs.example.com": "cname.ferndocs.com." } });
        expect(await classifyCustomDomain("docs.example.com", dns)).toEqual({
            type: "fern",
            target: "cname.ferndocs.com"
        });
    });

    it("detects a CNAME to Vercel", async () => {
        const dns = fakeDns({ cnames: { "docs.example.com": "b7278b3c9357963d.vercel-dns-013.com." } });
        expect(await classifyCustomDomain("docs.example.com", dns)).toEqual({
            type: "vercel",
            target: "b7278b3c9357963d.vercel-dns-013.com"
        });
    });

    it("follows a CNAME chain", async () => {
        const dns = fakeDns({
            cnames: { "docs.example.com": "docs.example.net", "docs.example.net": "cname.vercel-dns.com" }
        });
        expect((await classifyCustomDomain("docs.example.com", dns)).type).toBe("vercel");
    });

    it("detects an apex A record on Vercel's IPs", async () => {
        const dns = fakeDns({ a: { "example.com": ["76.76.21.21"] } });
        expect((await classifyCustomDomain("example.com", dns)).type).toBe("vercel");
    });

    it("treats a reverse proxy / own CDN as other", async () => {
        const dns = fakeDns({ a: { "example.com": ["104.18.5.93", "104.18.4.93"] } });
        expect(await classifyCustomDomain("example.com", dns)).toEqual({ type: "other" });
    });

    it("does not match look-alike hostnames", async () => {
        const dns = fakeDns({
            cnames: { "a.example.com": "notvercel-dns.com", "b.example.com": "ferndocs.com.evil.io" },
            a: { "notvercel-dns.com": ["1.2.3.4"], "ferndocs.com.evil.io": ["1.2.3.4"] }
        });
        expect((await classifyCustomDomain("a.example.com", dns)).type).toBe("other");
        expect((await classifyCustomDomain("b.example.com", dns)).type).toBe("other");
    });

    it("treats lookup failures as other", async () => {
        expect(await classifyCustomDomain("missing.example.com", fakeDns({}))).toEqual({ type: "other" });
    });
});

describe("checkCustomDomainsNotOnVercel", () => {
    const vercelDns = fakeDns({ cnames: { "docs.example.com": "cname.vercel-dns.com" } });

    it("warns before the cutoff", async () => {
        const { context, warn, failAndThrow } = createFakeContext();
        await checkCustomDomainsNotOnVercel({
            customDomains: ["docs.example.com/api"],
            context,
            now: BEFORE_CUTOFF,
            dns: vercelDns
        });
        expect(failAndThrow).not.toHaveBeenCalled();
        expect(warn).toHaveBeenCalledOnce();
        const message = String(warn.mock.calls[0]?.[0]);
        expect(message).toContain("docs.example.com");
        expect(message).toContain("cname.ferndocs.com");
        expect(message).toContain("December 1, 2026");
    });

    it("fails on and after the cutoff", async () => {
        const { context, warn } = createFakeContext();
        await expect(
            checkCustomDomainsNotOnVercel({
                customDomains: ["docs.example.com"],
                context,
                now: AFTER_CUTOFF,
                dns: vercelDns
            })
        ).rejects.toThrow("Publishing is blocked");
        expect(warn).not.toHaveBeenCalled();
    });

    it("passes Fern-routed and reverse-proxied domains", async () => {
        const { context, warn, failAndThrow } = createFakeContext();
        await checkCustomDomainsNotOnVercel({
            customDomains: ["docs.example.com", "example.com/docs"],
            context,
            now: AFTER_CUTOFF,
            dns: fakeDns({
                cnames: { "docs.example.com": "cname.ferndocs.com" },
                a: { "example.com": ["104.18.5.93"] }
            })
        });
        expect(warn).not.toHaveBeenCalled();
        expect(failAndThrow).not.toHaveBeenCalled();
    });

    it("lists only the Vercel domains", async () => {
        const { context, warn } = createFakeContext();
        await checkCustomDomainsNotOnVercel({
            customDomains: ["docs.example.com", "docs.other.com"],
            context,
            now: BEFORE_CUTOFF,
            dns: fakeDns({
                cnames: { "docs.example.com": "cname.vercel-dns.com", "docs.other.com": "cname.ferndocs.com" }
            })
        });
        const message = String(warn.mock.calls[0]?.[0]);
        expect(message).toContain("docs.example.com");
        expect(message).not.toContain("docs.other.com");
    });

    it("does nothing without custom domains", async () => {
        const { context, warn } = createFakeContext();
        const dns = { resolveCname: vi.fn(), resolve4: vi.fn() };
        await checkCustomDomainsNotOnVercel({ customDomains: [], context, now: AFTER_CUTOFF, dns });
        expect(dns.resolveCname).not.toHaveBeenCalled();
        expect(warn).not.toHaveBeenCalled();
    });
});
