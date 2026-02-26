import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { generateFdrApiDefinitionAsString } from "./generateFdrApiDefinitionAsString.js";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const FIXTURES: Fixture[] = [
    {
        name: "simple"
    },
    {
        name: "changelog"
    }
];

interface Fixture {
    name: string;
    audiences?: string[];
    language?: generatorsYml.GenerationLanguage;
    version?: string;
    only?: boolean;
}

describe("fdr", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async ({ signal }) => {
                const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name));
                const fdrContents = await generateFdrApiDefinitionAsString({
                    fixturePath,
                    language: fixture.language,
                    audiences: fixture.audiences,
                    version: fixture.version,
                    signal
                });
                // biome-ignore lint/suspicious/noMisplacedAssertion: allow
                expect(fdrContents).toMatchSnapshot();
            },
            90_000
        );
    }
});
