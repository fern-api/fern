// Where the Fern services live. The Fern CLI's builds set these per environment (prod, dev, local),
// so the wizard talks to the same Dashboard, Venus, and registry as the CLI running it.

export function dashboardOrigin(): string {
    return trimSlash(
        process.env.FERN_DASHBOARD_URL ??
            process.env.FERN_DASHBOARD_URL_DEFAULT ??
            "https://dashboard.buildwithfern.com"
    );
}

export function venusOrigin(): string {
    return trimSlash(process.env.DEFAULT_VENUS_ORIGIN ?? "https://venus.buildwithfern.com");
}

export function registryOrigin(): string {
    return trimSlash(
        process.env.FERN_FDR_ORIGIN ?? process.env.DEFAULT_FDR_ORIGIN ?? "https://registry.buildwithfern.com"
    );
}

function trimSlash(url: string): string {
    return url.replace(/\/$/, "");
}
