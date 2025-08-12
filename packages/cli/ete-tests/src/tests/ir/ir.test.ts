import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { readFile } from "fs/promises";
import path from "path";
import { runFernCli } from "../../utils/runFernCli";
import { generateIrAsString } from "./generateIrAsString";

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
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name));
                const irContents = await generateIrAsString({
                    fixturePath,
                    language: fixture.language,
                    audiences: fixture.audiences,
                    version: fixture.version
                });
                // biome-ignore lint/suspicious/noMisplacedAssertion: allow
                expect(irContents).toMatchSnapshot();
            },
            90_000
        );
    }

    it("works with latest version", async () => {
        const { stdout } = await runFernCli(["ir", "ir.json", "--version", "v27"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("migration")),
            reject: false
        });
        expect(stdout).toContain("Wrote IR to");
    }, 10_000);

    it("fails with invalid version", async () => {
        const { stdout } = await runFernCli(["ir", "ir.json", "--version", "v100"], {
            cwd: join(FIXTURES_DIR, RelativeFilePath.of("migration")),
            reject: false
        });
        expect(stdout).toContain("IR v100 does not exist");
    }, 10_000);
});

describe("ir from proto", () => {
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
