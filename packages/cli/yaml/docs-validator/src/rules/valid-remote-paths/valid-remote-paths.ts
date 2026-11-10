import { docsYml } from "@fern-api/configuration";

import { Rule } from "../../Rule.js";

export const ValidRemotePathsRule: Rule = {
    name: "valid-remote-paths",
    create: () => {
        return {
            file: async ({ config }) => {
                const remotePaths = config.remotePaths;
                if (remotePaths == null || remotePaths.length === 0) {
                    return [];
                }
                return docsYml
                    .remotePathProblems(remotePaths, siteHosts(config))
                    .map((message) => ({ severity: "fatal", message: `remote-paths: ${message}` }));
            }
        };
    }
};

/** Hostnames this site is served on, which a remote path must not point back at. */
export function siteHosts(config: docsYml.RawSchemas.DocsConfiguration): string[] {
    const hosts: string[] = [];
    for (const instance of config.instances) {
        const customDomains =
            instance.customDomain == null
                ? []
                : Array.isArray(instance.customDomain)
                  ? instance.customDomain
                  : [instance.customDomain];
        for (const url of [instance.url, ...customDomains]) {
            const host = hostnameOf(url);
            if (host != null) {
                hosts.push(host);
            }
        }
    }
    return hosts;
}

function hostnameOf(url: string): string | undefined {
    try {
        return new URL(url.includes("://") ? url : `https://${url}`).hostname;
    } catch {
        return undefined;
    }
}
