import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import path from "path";
import tmp from "tmp-promise";
import { runFernCli } from "../../utils/runFernCli.js";
import { generateIrAsString } from "./generateIrAsString.js";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const FIXTURES: Fixture[] = [
    {
        name: "file-upload"
    },
    {
        name: "streaming"
    },
    {
        name: "nested-example-reference"
    },
    {
        name: "auth-header-prefix"
    },
    {
        name: "simple"
    },
    {
        name: "simple",
        audiences: ["test"]
    },
    {
        name: "simple",
        audiences: ["internal"]
    },
    {
        name: "migration",
        version: "v1"
    },
    {
        name: "extended-examples"
    },
    {
        name: "packages"
    },
    {
        name: "multiple-environment-urls"
    },
    {
        name: "variables"
    },
    {
        name: "navigation-points-to"
    },
    {
        name: "webhooks"
    },
    {
        name: "response-property"
    }
];

interface Fixture {
    name: string;
    audiences?: string[];
    language?: generatorsYml.GenerationLanguage;
    version?: string;
    only?: boolean;
}

describe("ir", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it.concurrent)(
            `${JSON.stringify(fixture)}`,
            async ({ expect }) => {
                const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name));
                const irContents = await generateIrAsString({
                    fixturePath,
                    language: fixture.language,
                    audiences: fixture.audiences,
                    version: fixture.version
                });
                expect(irContents).toMatchSnapshot();
            },
            90_000
        );
    }

    it.concurrent("works with latest version", async ({ expect }) => {
        const tmpFile = await tmp.file({ postfix: ".json" });
        const { stdout } = await runFernCli(["ir", tmpFile.path, "--version", "v27"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("migration")),
            reject: false
        });
        await tmpFile.cleanup();
        expect(stdout).toContain("Wrote IR to");
    }, 30_000);

    it.concurrent("fails with invalid version", async ({ expect }) => {
        const tmpFile = await tmp.file({ postfix: ".json" });
        const { stdout } = await runFernCli(["ir", tmpFile.path, "--version", "v100"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("migration")),
            reject: false
        });
        await tmpFile.cleanup();
        expect(stdout).toContain("IR v100 does not exist");
    }, 30_000);
});

describe("ir from proto", () => {
    // biome-ignore lint/suspicious/noSkippedTests: Allow test skip for now
    it.skip("works with proto-ir", async () => {
        try {
            await runFernCli(["ir", "ir.json", "--from-openapi"], {
                cwd: join(FIXTURES_DIR, RelativeFilePath.of("proto-ir")),
                reject: false
            });
            const contents = await readFile(
                path.join(FIXTURES_DIR, RelativeFilePath.of("proto-ir"), "ir.json"),
                "utf-8"
            );
            expect(contents).toMatchSnapshot();
        } catch (error) {
            console.error("IMPORTANT: Ensure buf version matches version from CI/CD (v1.50.0 as of 7/31/25).");
            throw error;
        }
    }, 10_000);
    // biome-ignore lint/suspicious/noSkippedTests: Allow test skip for now
    it.skip("ir from proto through oas", async () => {
        try {
            await runFernCli(["ir", "ir.json", "--from-openapi"], {
                cwd: join(FIXTURES_DIR, RelativeFilePath.of("proto-oas-ir")),
                reject: false
            });
            const contents = await readFile(
                path.join(FIXTURES_DIR, RelativeFilePath.of("proto-oas-ir"), "ir.json"),
                "utf-8"
            );
            expect(contents).toMatchSnapshot();
        } catch (error) {
            console.error("IMPORTANT: Ensure buf version matches version from CI/CD (v1.50.0 as of 7/31/25).");
            throw error;
        }
    }, 10_000);
});
