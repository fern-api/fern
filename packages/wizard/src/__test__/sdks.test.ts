import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import os from "os";
import path from "path";
import { describe, expect, it } from "vitest";
import { ensureSdkGroup, readConfiguredSdks, readOrganization, SDK_LANGUAGES } from "../steps/sdks";
import { billingUrl } from "../ui";

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
});
