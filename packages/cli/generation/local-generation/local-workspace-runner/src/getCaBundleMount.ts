import { FERN_CA_BUNDLE_ENV_VAR } from "@fern-api/core-utils";
import { readFileSync, statSync } from "fs";
import path from "path";

import { CONTAINER_FERN_DIRECTORY } from "./constants.js";

export const CONTAINER_CA_BUNDLE_PATH = path.posix.join(CONTAINER_FERN_DIRECTORY, "ca-bundle.crt");

const PEM_CERTIFICATE_HEADER = "-----BEGIN CERTIFICATE-----";
/**
 * Public root stores ship well over a hundred certificates; anything far below that is
 * almost certainly a corporate-CA-only file (root, or root + intermediate) rather than a
 * complete bundle.
 */
const MIN_CERTIFICATES_FOR_COMPLETE_BUNDLE = 50;

export interface CaBundleMount {
    hostPath: string;
    /** Read-only bind (`host:container:ro`). */
    bind: string;
    /**
     * Points Node, OpenSSL-based tooling and git at the mounted bundle. The JVM does not
     * honor any of these; Java generation on an intercepted network should also set
     * FERN_JAVA_SKIP_FORMATTING.
     */
    envVars: {
        NODE_EXTRA_CA_CERTS: string;
        SSL_CERT_FILE: string;
        GIT_SSL_CAINFO: string;
    };
    /**
     * Set when the bundle looks like a corporate-CA-only file rather than a complete
     * bundle. SSL_CERT_FILE and GIT_SSL_CAINFO replace the container's trust store, so
     * such a file would make git and OpenSSL reject every publicly-signed host.
     */
    warning?: string;
}

/**
 * Returns the mount for the CA bundle named by FERN_CA_BUNDLE, or undefined when the
 * variable is unset. Throws if it is set but does not point at a PEM file, since a
 * silently ignored bundle would only surface later as an opaque TLS error inside the
 * generator.
 */
export function getCaBundleMount(env: NodeJS.ProcessEnv = process.env): CaBundleMount | undefined {
    const value = env[FERN_CA_BUNDLE_ENV_VAR];
    if (value == null || value.trim() === "") {
        return undefined;
    }
    const hostPath = path.resolve(value);
    const contents = readPemFile(hostPath);
    if (contents == null) {
        throw new Error(`${FERN_CA_BUNDLE_ENV_VAR} is set to ${hostPath}, but that is not a readable file.`);
    }
    const certificateCount = contents.split(PEM_CERTIFICATE_HEADER).length - 1;
    if (certificateCount === 0) {
        throw new Error(`${FERN_CA_BUNDLE_ENV_VAR} is set to ${hostPath}, but it contains no PEM certificates.`);
    }
    return {
        hostPath,
        bind: `${hostPath}:${CONTAINER_CA_BUNDLE_PATH}:ro`,
        envVars: {
            NODE_EXTRA_CA_CERTS: CONTAINER_CA_BUNDLE_PATH,
            SSL_CERT_FILE: CONTAINER_CA_BUNDLE_PATH,
            GIT_SSL_CAINFO: CONTAINER_CA_BUNDLE_PATH
        },
        warning:
            certificateCount < MIN_CERTIFICATES_FOR_COMPLETE_BUNDLE
                ? `${FERN_CA_BUNDLE_ENV_VAR} (${hostPath}) contains only ${certificateCount} certificate(s). It replaces the trust store for git and OpenSSL inside the generator container, so it should be a complete bundle (system CA certificates plus your corporate CA) or TLS to public hosts will fail.`
                : undefined
    };
}

/**
 * The JVM uses its own truststore and ignores NODE_EXTRA_CA_CERTS / SSL_CERT_FILE /
 * GIT_SSL_CAINFO, so Gradle's network access (distribution download, Spotless from Maven
 * Central) in Java generators is not covered by the mounted bundle.
 */
export function getJvmCaBundleWarning(generatorName: string): string | undefined {
    if (!/(^|\/)fern-java-/.test(generatorName)) {
        return undefined;
    }
    return `${generatorName} runs on the JVM, which does not honor ${FERN_CA_BUNDLE_ENV_VAR}. Gradle steps inside the container (e.g. spotlessApply) may fail on a TLS-intercepted network; set FERN_JAVA_SKIP_FORMATTING=true to skip them.`;
}

function readPemFile(filePath: string): string | undefined {
    try {
        if (!statSync(filePath).isFile()) {
            return undefined;
        }
        return readFileSync(filePath, "utf-8");
    } catch {
        return undefined;
    }
}
