import { mkdtempSync, rmSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import path from "path";
import { afterAll, describe, expect, it } from "vitest";
import {
    CONTAINER_CA_BUNDLE_DIRECTORY,
    getCaBundleBinds,
    getCaBundleEnvVars,
    getHostCaBundles
} from "../getHostCaBundle.js";

const dir = mkdtempSync(path.join(tmpdir(), "fern-ca-bundle-"));
const extraOnly = path.join(dir, "corp-ca.pem");
const fullBundle = path.join(dir, "ca-certificates.crt");
writeFileSync(extraOnly, "-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----\n");
writeFileSync(fullBundle, "-----BEGIN CERTIFICATE-----\n-----END CERTIFICATE-----\n");

const container0 = path.join(CONTAINER_CA_BUNDLE_DIRECTORY, "0.crt");
const container1 = path.join(CONTAINER_CA_BUNDLE_DIRECTORY, "1.crt");

afterAll(() => {
    rmSync(dir, { recursive: true, force: true });
});

describe("getHostCaBundles", () => {
    it("returns nothing when no CA env var is set", () => {
        expect(getHostCaBundles({})).toEqual([]);
    });

    it("skips missing files and empty values", () => {
        expect(
            getHostCaBundles({
                NODE_EXTRA_CA_CERTS: path.join(dir, "missing.pem"),
                SSL_CERT_FILE: "  ",
                GIT_SSL_CAINFO: fullBundle
            })
        ).toEqual([{ envVar: "GIT_SSL_CAINFO", hostPath: fullBundle, containerPath: container0 }]);
    });

    it("only forwards the variables that are set on the host", () => {
        const bundles = getHostCaBundles({ NODE_EXTRA_CA_CERTS: extraOnly });
        expect(getCaBundleEnvVars(bundles)).toEqual({ NODE_EXTRA_CA_CERTS: container0 });
        expect(getCaBundleBinds(bundles)).toEqual([`${extraOnly}:${container0}:ro`]);
    });

    it("mounts an extra-only bundle and a full bundle separately, preserving each variable's target", () => {
        const bundles = getHostCaBundles({
            NODE_EXTRA_CA_CERTS: extraOnly,
            SSL_CERT_FILE: fullBundle,
            GIT_SSL_CAINFO: fullBundle
        });
        expect(getCaBundleBinds(bundles)).toEqual([`${extraOnly}:${container0}:ro`, `${fullBundle}:${container1}:ro`]);
        expect(getCaBundleEnvVars(bundles)).toEqual({
            NODE_EXTRA_CA_CERTS: container0,
            SSL_CERT_FILE: container1,
            GIT_SSL_CAINFO: container1
        });
    });
});
