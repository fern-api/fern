import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { CONTAINER_CA_BUNDLE_PATH, getCaBundleMount } from "../getCaBundleMount.js";

const CERT = "-----BEGIN CERTIFICATE-----\nMIIB\n-----END CERTIFICATE-----\n";

describe("getCaBundleMount", () => {
    let dir: string;
    let fullBundle: string;
    let singleCert: string;
    let notPem: string;

    beforeAll(() => {
        dir = mkdtempSync(path.join(tmpdir(), "fern-ca-bundle-"));
        fullBundle = path.join(dir, "ca-certificates.crt");
        singleCert = path.join(dir, "corp-ca.pem");
        notPem = path.join(dir, "notes.txt");
        writeFileSync(fullBundle, CERT + CERT);
        writeFileSync(singleCert, CERT);
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
            },
            warning: undefined
        });
    });

    it("warns when the bundle holds a single certificate", () => {
        expect(getCaBundleMount({ FERN_CA_BUNDLE: singleCert })?.warning).toMatch(/single certificate/);
    });
});
