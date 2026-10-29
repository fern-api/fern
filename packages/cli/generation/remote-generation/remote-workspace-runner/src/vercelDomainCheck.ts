import { Resolver } from "node:dns/promises";
import { CliError, TaskContext } from "@fern-api/task-context";
import chalk from "chalk";

import { getBasepath } from "./customDomainValidation.js";

/** From this moment on, publishing to a custom domain that still points at Vercel fails. */
export const VERCEL_DNS_HARD_ERROR_DATE = new Date("2026-12-01T00:00:00Z");

const FERN_CNAME_TARGET = "cname.ferndocs.com";
const FERN_CNAME_ZONE = "ferndocs.com";
const DASHBOARD_URL = "https://dashboard.buildwithfern.com";
const MAX_CNAME_HOPS = 8;
const LOOKUP_TIMEOUT_MS = 5000;

// Vercel's IPv4 nets per ARIN (org ZEITI, https://whois.arin.net/rest/org/ZEITI/nets); A records here mean an apex domain is on Vercel.
const VERCEL_RANGES = [
    "143.13.0.0/16",
    "155.121.0.0/16",
    "64.29.17.0/24",
    "64.239.109.0/24",
    "64.239.123.0/24",
    "66.33.60.0/24",
    "76.76.21.0/24",
    "198.169.1.0/24",
    "198.169.2.0/24",
    "216.150.1.0/24",
    "216.150.16.0/24",
    "216.198.79.0/24",
    "216.230.84.0/24",
    "216.230.86.0/24"
];

export type CustomDomainRouting =
    | { type: "fern"; target: string }
    | { type: "vercel"; target: string }
    /** Reverse proxy, the customer's own CDN, or anything we can't attribute. */
    | { type: "other" };

export interface DnsLookup {
    resolveCname(host: string): Promise<string[]>;
    resolve4(host: string): Promise<string[]>;
    /** Aborts in-flight queries so a hung resolver doesn't outlive the timeout. */
    cancel?(): void;
}

export async function classifyCustomDomain(host: string, dns: DnsLookup): Promise<CustomDomainRouting> {
    let current = normalizeHostname(host);
    for (let hop = 0; hop < MAX_CNAME_HOPS; hop++) {
        const [next] = await dns.resolveCname(current).catch(() => []);
        if (next == null) {
            break;
        }
        current = normalizeHostname(next);
        if (isWithin(current, FERN_CNAME_ZONE)) {
            return { type: "fern", target: current };
        }
        if (isVercelCname(current)) {
            return { type: "vercel", target: current };
        }
    }

    const ips = await dns.resolve4(current).catch(() => []);
    if (ips.length > 0 && ips.every((ip) => inRanges(ip, VERCEL_RANGES))) {
        return { type: "vercel", target: ips.join(", ") };
    }
    return { type: "other" };
}

/**
 * Warns (and, from {@link VERCEL_DNS_HARD_ERROR_DATE}, fails) when a custom domain still
 * CNAMEs to Vercel instead of Fern's hosting. Subpath domains are always served through the
 * customer's reverse proxy (whose host may itself be on Vercel), so they are skipped.
 * Lookup failures never block a publish.
 */
export async function checkCustomDomainsNotOnVercel({
    customDomains,
    context,
    now = new Date(),
    dns = createResolver()
}: {
    customDomains: readonly string[];
    context: TaskContext;
    now?: Date;
    dns?: DnsLookup;
}): Promise<void> {
    const hosts = [...new Set(customDomains.filter((domain) => getBasepath(domain) === "/").map(toHostname))].filter(
        (host): host is string => host != null
    );
    if (hosts.length === 0) {
        return;
    }

    const results = await Promise.all(
        hosts.map(async (host) => ({
            host,
            routing: await withTimeout(classifyCustomDomain(host, dns), LOOKUP_TIMEOUT_MS).catch(
                (): CustomDomainRouting => ({ type: "other" })
            )
        }))
    );
    dns.cancel?.();
    for (const { host, routing } of results) {
        context.logger.debug(`Custom domain ${host} routing: ${routing.type}`);
    }

    const onVercel = results.filter(
        (result): result is { host: string; routing: { type: "vercel"; target: string } } =>
            result.routing.type === "vercel"
    );
    if (onVercel.length === 0) {
        return;
    }

    const isHardError = now.getTime() >= VERCEL_DNS_HARD_ERROR_DATE.getTime();
    const message = getVercelDnsMessage(
        onVercel.map(({ host, routing }) => ({ host, target: routing.target })),
        isHardError
    );
    if (isHardError) {
        context.failAndThrow(message, undefined, { code: CliError.Code.ConfigError });
        return;
    }
    context.logger.warn(message);
}

export function getVercelDnsMessage(domains: { host: string; target: string }[], isHardError: boolean): string {
    const color = isHardError ? chalk.red : chalk.yellow;
    const plural = domains.length > 1;
    const deadline = "December 1, 2026";
    const title = isHardError
        ? `[SEVERE] Publishing is blocked: your custom domain${plural ? "s" : ""} still point${plural ? "" : "s"} to Vercel.`
        : `Action required by ${deadline}: your custom domain${plural ? "s" : ""} still point${plural ? "" : "s"} to Vercel.`;
    const body = [
        ...domains.map(({ host, target }) => `  ${host}  →  ${target}`),
        "",
        "Fern Docs has moved to new hosting. To switch (your docs stay live on the current",
        "setup until the DNS change is made):",
        "",
        `  1. Open ${DASHBOARD_URL}, select this docs site and click "Make the switch".`,
        "  2. Verify domain ownership with the DNS record it shows.",
        `  3. Change your CNAME record to ${FERN_CNAME_TARGET}.`,
        "",
        isHardError
            ? `Since ${deadline}, docs cannot be published to a domain that points to Vercel.`
            : `From ${deadline}, this warning becomes an error and publishing will fail.`,
        "Questions? Reach out in your Fern Slack channel or email support@buildwithfern.com."
    ];
    const width = Math.max(title.length, ...body.map((line) => line.length)) + 2;
    const border = color("━".repeat(width));
    if (!isHardError) {
        return ["", border, ` ${chalk.bold(title)}`, "", ...body.map((line) => ` ${line}`), border, ""].join("\n");
    }
    // The logger colors the whole error red, which is hard to read; a reset keeps the body in the terminal's default color.
    const header = chalk.bgRed.whiteBright.bold(` ${title}`.padEnd(width));
    return ["", border, header, "", ...body.map((line) => chalk.reset(` ${line}`)), border, ""].join("\n");
}

function createResolver(): DnsLookup {
    const resolver = new Resolver({ timeout: 2000, tries: 2 });
    return {
        resolveCname: (host) => resolver.resolveCname(host),
        resolve4: (host) => resolver.resolve4(host),
        cancel: () => resolver.cancel()
    };
}

function toHostname(domain: string): string | undefined {
    try {
        return normalizeHostname(new URL(`https://${domain}`).hostname);
    } catch {
        return undefined;
    }
}

function normalizeHostname(value: string): string {
    return value.trim().toLowerCase().replace(/\.$/, "");
}

function isWithin(name: string, zone: string): boolean {
    return name === zone || name.endsWith(`.${zone}`);
}

function isVercelCname(name: string): boolean {
    return /(^|\.)vercel-dns(-\d+)?\.com$/.test(name);
}

function ipv4ToInt(ip: string): number | undefined {
    const parts = ip.split(".");
    if (parts.length !== 4) {
        return undefined;
    }
    let value = 0;
    for (const part of parts) {
        if (!/^\d{1,3}$/.test(part) || Number(part) > 255) {
            return undefined;
        }
        value = value * 256 + Number(part);
    }
    return value;
}

function inRanges(ip: string, ranges: readonly string[]): boolean {
    const value = ipv4ToInt(ip);
    if (value == null) {
        return false;
    }
    return ranges.some((range) => {
        const [base = "", bits = "32"] = range.split("/");
        const start = ipv4ToInt(base);
        return start != null && value >= start && value < start + 2 ** (32 - Number(bits));
    });
}

async function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const timeout = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error(`timed out after ${ms}ms`)), ms);
    });
    try {
        return await Promise.race([promise, timeout]);
    } finally {
        clearTimeout(timer);
    }
}
