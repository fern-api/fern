import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CONTAINER_CA_BUNDLE_PATH, getCaBundleMount, getJvmCaBundleWarning } from "../getCaBundleMount.js";

const CERT = "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n";

describe("getCaBundleMount", () => {
    let dir: string;
    let fullBundle: string;
    let singleCert: string;
    let rootAndIntermediate: string;
    let notPem: string;

    beforeAll(() => {
        dir = mkdtempSync(path.join(tmpdir(), "fern-ca-bundle-"));
        fullBundle = path.join(dir, "ca-certificates.crt");
        singleCert = path.join(dir, "corp-ca.pem");
        rootAndIntermediate = path.join(dir, "corp-chain.pem");
        notPem = path.join(dir, "notes.txt");
        writeFileSync(fullBundle, CERT.repeat(150));
        writeFileSync(singleCert, CERT);
        writeFileSync(rootAndIntermediate, CERT + CERT);
        writeFileSync(notPem, "hello");
    });

    afterAll(() => {
        rmSync(dir, { recursive: true, force: true });
    });

    it("returns undefined when FERN_CA_BUNDLE is unset or empty", () => {
        expect(getCaBundleMount({})).toBeUndefined();
        expect(getCaBundleMount({ FERN_CA_BUNDLE: "  " })).toBeUndefined();
    });

    it("throws when FERN_CA_BUNDLE does not point at a readable file", () => {
        expect(() => getCaBundleMount({ FERN_CA_BUNDLE: path.join(dir, "missing.pem") })).toThrow(
            /FERN_CA_BUNDLE is set to .*missing\.pem, but that is not a readable file/
        );
        expect(() => getCaBundleMount({ FERN_CA_BUNDLE: dir })).toThrow(/not a readable file/);
    });

    it("throws when the file contains no PEM certificates", () => {
        expect(() => getCaBundleMount({ FERN_CA_BUNDLE: notPem })).toThrow(/contains no PEM certificates/);
    });

    it("mounts the bundle read-only at a posix path and points node, openssl and git at it", () => {
        expect(CONTAINER_CA_BUNDLE_PATH).toBe("/fern/ca-bundle.crt");
        expect(getCaBundleMount({ FERN_CA_BUNDLE: fullBundle })).toEqual({
            hostPath: fullBundle,
            bind: `${fullBundle}:${CONTAINER_CA_BUNDLE_PATH}:ro`,
            envVars: {
                NODE_EXTRA_CA_CERTS: CONTAINER_CA_BUNDLE_PATH,
                SSL_CERT_FILE: CONTAINER_CA_BUNDLE_PATH,
                GIT_SSL_CAINFO: CONTAINER_CA_BUNDLE_PATH
            }
        });
    });

    it("does not judge bundle completeness — a corporate-CA-only file is accepted as-is", () => {
        // Whether an incomplete bundle breaks public TLS depends on the generator image
        // (images with a populated /etc/ssl/certs fall back to it, bundle-only images do
        // not), so the CLI documents the requirement instead of guessing from a count.
        expect(getCaBundleMount({ FERN_CA_BUNDLE: singleCert })).toBeDefined();
        expect(getCaBundleMount({ FERN_CA_BUNDLE: rootAndIntermediate })).toBeDefined();
    });

    it("warns for JVM-based generators only", () => {
        expect(getJvmCaBundleWarning("fernapi/fern-java-sdk")).toMatch(/FERN_JAVA_SKIP_FORMATTING/);
        expect(getJvmCaBundleWarning("fernapi/fern-java-spring")).toBeDefined();
        expect(getJvmCaBundleWarning("fernapi/fern-typescript-sdk")).toBeUndefined();
        expect(getJvmCaBundleWarning("fernapi/fern-go-sdk")).toBeUndefined();
    });
});
