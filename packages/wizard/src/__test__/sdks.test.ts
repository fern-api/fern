import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import {
    ensureSdkGroup,
    isNonEmptyDirectory,
    readConfiguredSdks,
    readOrganization,
    SDK_LANGUAGES,
    sdkGroupWritesOnlyLocally,
    setGeneratorVersion
} from "../steps/sdks";
import { billingUrl } from "../ui";
import { generatorError, parseUnavailableGeneratorVersion, summarizeFailure } from "../wizard";

async function project(files: Record<string, string>): Promise<string> {
    const dir = await mkdtemp(path.join(os.tmpdir(), "fern-wizard-sdks-"));
    for (const [file, contents] of Object.entries(files)) {
        await mkdir(path.dirname(path.join(dir, file)), { recursive: true });
        await writeFile(path.join(dir, file), contents);
    }
    return dir;
}

describe("SDK configuration", () => {
    it("reads the default group's SDK generators and where they write", async () => {
        const dir = await project({
            "fern/generators.yml": [
                "default-group: local",
                "groups:",
                "  local:",
                "    generators:",
                "      - name: fern-typescript-sdk",
                "        output:",
                "          location: local-file-system",
                "          path: ../sdks/typescript",
                "      - name: fernapi/fern-python-sdk",
                "        output:",
                "          location: pypi",
                "      - name: fern-postman",
                "  publish:",
                "    generators:",
                "      - name: fern-go-sdk"
            ].join("\n")
        });
        const sdks = await readConfiguredSdks(dir);
        expect(sdks.map((sdk) => sdk.language.label)).toEqual(["TypeScript", "Python"]);
        expect(sdks[0]?.outputPath).toBe(path.join(dir, "sdks", "typescript"));
        // Published SDKs aren't written to the repository.
        expect(sdks[1]?.outputPath).toBeUndefined();
        await rm(dir, { recursive: true, force: true });
    });

    it("handles projects without generators.yml", async () => {
        const dir = await project({});
        await expect(readConfiguredSdks(dir)).resolves.toEqual([]);
        await rm(dir, { recursive: true, force: true });
    });

    it("reads the organization from fern.config.json", async () => {
        const dir = await project({ "fern/fern.config.json": '{ "organization": "acme", "version": "*" }' });
        await expect(readOrganization(dir)).resolves.toBe("acme");
        await expect(readOrganization(path.join(dir, "missing"))).resolves.toBeUndefined();
        await rm(dir, { recursive: true, force: true });
    });

    it("offers TypeScript and Python on the Free plan and sends the rest to billing", () => {
        expect(SDK_LANGUAGES.filter((language) => language.free).map((language) => language.label)).toEqual([
            "TypeScript",
            "Python"
        ]);
        expect(billingUrl("acme")).toBe("https://dashboard.buildwithfern.com/acme/billing");
        expect(billingUrl(undefined)).toBe("https://dashboard.buildwithfern.com");
    });

    it("adds a default group to a project without one, and keeps an existing group", async () => {
        const bare = await project({
            "fern/generators.yml": "# keep me\napi:\n  specs:\n    - openapi: ../openapi.yaml\n"
        });
        await expect(ensureSdkGroup(bare)).resolves.toBe("local");
        const written = await readFile(path.join(bare, "fern", "generators.yml"), "utf8");
        expect(written).toContain("# keep me");
        expect(written).toContain("default-group: local");

        const grouped = await project({ "fern/generators.yml": "groups:\n  sdk:\n    generators: []\n" });
        await expect(ensureSdkGroup(grouped)).resolves.toBe("sdk");
        await expect(ensureSdkGroup(path.join(grouped, "missing"))).resolves.toBeUndefined();
        await Promise.all([bare, grouped].map((dir) => rm(dir, { recursive: true, force: true })));
    });

    it("generates automatically only when every output is a folder in the repository", async () => {
        const local = await project({
            "fern/generators.yml": [
                "default-group: local",
                "groups:",
                "  local:",
                "    generators:",
                "      - name: fern-typescript-sdk",
                "        output:",
                "          location: local-file-system",
                "          path: ../sdks/typescript"
            ].join("\n")
        });
        const publishing = await project({
            "fern/generators.yml": [
                "default-group: release",
                "groups:",
                "  release:",
                "    generators:",
                "      - name: fern-typescript-sdk",
                "        output:",
                "          location: npm",
                "          package-name: acme"
            ].join("\n")
        });
        await expect(sdkGroupWritesOnlyLocally(local)).resolves.toBe(true);
        await expect(sdkGroupWritesOnlyLocally(publishing)).resolves.toBe(false);
        await Promise.all([local, publishing].map((dir) => rm(dir, { recursive: true, force: true })));
    });

    it("moves a pinned generator to a version Fern's servers have", async () => {
        const dir = await project({
            "fern/generators.yml": [
                "# keep me",
                "default-group: local",
                "groups:",
                "  local:",
                "    generators:",
                "      - name: fern-typescript-sdk",
                "        version: 3.107.6",
                "      - name: fern-python-sdk",
                "        version: 3.107.6"
            ].join("\n")
        });
        await expect(setGeneratorVersion(dir, "fernapi/fern-typescript-sdk", "3.107.6", "3.107.3")).resolves.toBe(true);
        const written = await readFile(path.join(dir, "fern", "generators.yml"), "utf8");
        expect(written).toContain("# keep me");
        expect(written).toContain("version: 3.107.3");
        // Only the named generator changes.
        expect(written.match(/3\.107\.6/g)).toHaveLength(1);
        await expect(setGeneratorVersion(dir, "fern-go-sdk", "1.0.0", "1.0.1")).resolves.toBe(false);
        await rm(dir, { recursive: true, force: true });
    });

    it("tells an empty SDK folder from a generated one", async () => {
        const dir = await project({ "sdks/typescript/package.json": "{}" });
        await mkdir(path.join(dir, "sdks", "python"), { recursive: true });
        await expect(isNonEmptyDirectory(path.join(dir, "sdks", "typescript"))).resolves.toBe(true);
        await expect(isNonEmptyDirectory(path.join(dir, "sdks", "python"))).resolves.toBe(false);
        await expect(isNonEmptyDirectory(path.join(dir, "sdks", "go"))).resolves.toBe(false);
        await rm(dir, { recursive: true, force: true });
    });

    it("reads Fern's generation errors", () => {
        const unavailable = [
            "[api]: local fernapi/fern-typescript-sdk Failed to submit sdk-gen-api build: Generator fernapi/fern-typescript-sdk version 3.107.6 is not currently available. The latest available version in the same major line is 3.107.3.",
            "[api]: local fernapi/fern-typescript-sdk Failed."
        ].join("\n");
        expect(parseUnavailableGeneratorVersion(unavailable)).toEqual({
            generator: "fernapi/fern-typescript-sdk",
            requested: "3.107.6",
            available: "3.107.3"
        });
        expect(parseUnavailableGeneratorVersion("[api]: local Failed.")).toBeUndefined();

        const crashed = [
            "[api]: local fernapi/fern-typescript-sdk The promise rejected with the reason:",
            "[api]: local fernapi/fern-typescript-sdk Error: Unsupported xml scalar type container in WrapperCollection",
            "[api]: local fernapi/fern-typescript-sdk     at XmlObjectGenerator.getScalarParser (XmlObjectGenerator.ts:803:23)",
            "[api]: local Finished."
        ].join("\n");
        expect(generatorError(crashed)).toBe("Unsupported xml scalar type container in WrapperCollection");
        expect(generatorError("[api]: local Finished.")).toBeUndefined();
    });

    it("explains a failed fern command without the upgrade notice", () => {
        const output = [
            "Unsupported OpenAPI version: 3.2.0",
            "╭──────────────────────────────────╮",
            "│        Upgrades available        │",
            "╰──────────────────────────────────╯"
        ].join("\n");
        expect(summarizeFailure(output)).toBe("Unsupported OpenAPI version: 3.2.0");
    });
});
