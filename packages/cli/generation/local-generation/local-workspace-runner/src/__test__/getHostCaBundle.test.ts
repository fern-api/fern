import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterAll, describe, expect, it } from "vitest";
import { CONTAINER_CA_BUNDLE_PATH, getContainerCaBundleEnvVars, getHostCaBundle } from "../getHostCaBundle.js";

const dir = mkdtempSync(path.join(tmpdir(), "fern-ca-bundle-"));
const bundlePath = path.join(dir, "ca.pem");
writeFileSync(bundlePath, "-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----\n");

afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
});

describe("getHostCaBundle", () => {
    it("returns undefined when no CA env var is set", () => {
        expect(getHostCaBundle({})).toBeUndefined();
    });

    it("returns undefined when the referenced file does not exist", () => {
        expect(getHostCaBundle({ NODE_EXTRA_CA_CERTS: path.join(dir, "missing.pem") })).toBeUndefined();
    });

    it("ignores empty values", () => {
        expect(getHostCaBundle({ NODE_EXTRA_CA_CERTS: "  ", SSL_CERT_FILE: bundlePath })).toEqual({
            hostPath: bundlePath,
            sourceEnvVar: "SSL_CERT_FILE"
        });
    });

    it("prefers NODE_EXTRA_CA_CERTS over SSL_CERT_FILE and GIT_SSL_CAINFO", () => {
        expect(
            getHostCaBundle({
                GIT_SSL_CAINFO: bundlePath,
                SSL_CERT_FILE: bundlePath,
                NODE_EXTRA_CA_CERTS: bundlePath
            })
        ).toEqual({ hostPath: bundlePath, sourceEnvVar: "NODE_EXTRA_CA_CERTS" });
    });

    it("falls through to the next env var when an earlier one points at a missing file", () => {
        expect(
            getHostCaBundle({
                NODE_EXTRA_CA_CERTS: path.join(dir, "missing.pem"),
                GIT_SSL_CAINFO: bundlePath
            })
        ).toEqual({ hostPath: bundlePath, sourceEnvVar: "GIT_SSL_CAINFO" });
    });
});

describe("getContainerCaBundleEnvVars", () => {
    it("points every CA env var at the mounted bundle", () => {
        expect(getContainerCaBundleEnvVars()).toEqual({
            NODE_EXTRA_CA_CERTS: CONTAINER_CA_BUNDLE_PATH,
            SSL_CERT_FILE: CONTAINER_CA_BUNDLE_PATH,
            GIT_SSL_CAINFO: CONTAINER_CA_BUNDLE_PATH
        });
    });
});
