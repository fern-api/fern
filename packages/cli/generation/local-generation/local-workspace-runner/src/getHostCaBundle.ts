import { existsSync, statSync } from "fs";
import path from "path";
import { CONTAINER_FERN_DIRECTORY } from "./constants.js";

/**
 * Environment variables, in priority order, that point at a PEM bundle of extra
 * CA certificates on the host. Corporate networks that intercept TLS (e.g. Okta,
 * Zscaler) typically require one of these so that Node, git and OpenSSL-based
 * tools trust the interception CA.
 */
export const CA_BUNDLE_ENV_VARS = ["NODE_EXTRA_CA_CERTS", "SSL_CERT_FILE", "GIT_SSL_CAINFO"] as const;

export const CONTAINER_CA_BUNDLE_PATH = path.join(CONTAINER_FERN_DIRECTORY, "ca-certificates.crt");

export interface HostCaBundle {
    /** Absolute path to the PEM bundle on the host. */
    hostPath: string;
    /** The environment variable the bundle was discovered from. */
    sourceEnvVar: (typeof CA_BUNDLE_ENV_VARS)[number];
}

/**
 * Returns the first CA bundle referenced by {@link CA_BUNDLE_ENV_VARS} that
 * exists on the host, or undefined if none is configured.
 */
export function getHostCaBundle(env: NodeJS.ProcessEnv = process.env): HostCaBundle | undefined {
    for (const envVar of CA_BUNDLE_ENV_VARS) {
        const value = env[envVar];
        if (value == null || value.trim() === "") {
            continue;
        }
        const hostPath = path.resolve(value);
        if (existsSync(hostPath) && statSync(hostPath).isFile()) {
            return { hostPath, sourceEnvVar: envVar };
        }
    }
    return undefined;
}

/**
 * Environment variables to set inside the generator container so that Node,
 * git and OpenSSL-based tools all trust the mounted CA bundle.
 */
export function getContainerCaBundleEnvVars(): Record<string, string> {
    return Object.fromEntries(CA_BUNDLE_ENV_VARS.map((envVar) => [envVar, CONTAINER_CA_BUNDLE_PATH]));
}
