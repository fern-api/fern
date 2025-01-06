import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

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
                // eslint-disable-next-line jest/no-standalone-expect
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
