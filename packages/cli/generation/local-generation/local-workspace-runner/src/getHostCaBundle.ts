import { statSync } from "fs";
import path from "path";
import { CONTAINER_FERN_DIRECTORY } from "./constants.js";

/**
 * Environment variables that point at a PEM bundle of CA certificates on the host.
 * Corporate networks that intercept TLS (e.g. Okta, Zscaler) typically require one
 * or more of these so that Node, git and OpenSSL-based tools trust the interception CA.
 *
 * Note that NODE_EXTRA_CA_CERTS *extends* Node's default trust store, whereas
 * SSL_CERT_FILE and GIT_SSL_CAINFO *replace* their consumers' trust stores. Each
 * variable is therefore forwarded independently: a variable is only set inside the
 * container if it is set on the host, pointing at that same file.
 */
export const CA_BUNDLE_ENV_VARS = ["NODE_EXTRA_CA_CERTS", "SSL_CERT_FILE", "GIT_SSL_CAINFO"] as const;

export type CaBundleEnvVar = (typeof CA_BUNDLE_ENV_VARS)[number];

export const CONTAINER_CA_BUNDLE_DIRECTORY = path.join(CONTAINER_FERN_DIRECTORY, "ca-certificates");

export interface HostCaBundle {
    /** The environment variable the bundle was discovered from. */
    envVar: CaBundleEnvVar;
    /** Absolute path to the PEM bundle on the host. */
    hostPath: string;
    /** Path at which the bundle is mounted inside the container. */
    containerPath: string;
}

/**
 * Returns every CA bundle referenced by {@link CA_BUNDLE_ENV_VARS} that exists on
 * the host. Variables pointing at the same file share a single container path.
 */
export function getHostCaBundles(env: NodeJS.ProcessEnv = process.env): HostCaBundle[] {
    const containerPathByHostPath = new Map<string, string>();
    const bundles: HostCaBundle[] = [];
    for (const envVar of CA_BUNDLE_ENV_VARS) {
        const value = env[envVar];
        if (value == null || value.trim() === "") {
            continue;
        }
        const hostPath = path.resolve(value);
        if (!isReadableFile(hostPath)) {
            continue;
        }
        let containerPath = containerPathByHostPath.get(hostPath);
        if (containerPath == null) {
            containerPath = path.join(CONTAINER_CA_BUNDLE_DIRECTORY, `${containerPathByHostPath.size}.crt`);
            containerPathByHostPath.set(hostPath, containerPath);
        }
        bundles.push({ envVar, hostPath, containerPath });
    }
    return bundles;
}

function isReadableFile(filePath: string): boolean {
    try {
        return statSync(filePath).isFile();
    } catch {
        return false;
    }
}

/** Read-only bind mounts (`host:container:ro`), one per distinct host file. */
export function getCaBundleBinds(bundles: HostCaBundle[]): string[] {
    const binds = new Set(bundles.map((bundle) => `${bundle.hostPath}:${bundle.containerPath}:ro`));
    return [...binds];
}

/** Environment variables to set inside the container, mirroring the host's. */
export function getCaBundleEnvVars(bundles: HostCaBundle[]): Record<string, string> {
    return Object.fromEntries(bundles.map((bundle) => [bundle.envVar, bundle.containerPath]));
}
