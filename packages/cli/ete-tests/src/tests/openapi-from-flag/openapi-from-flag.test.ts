import { generatorsYml } from "@fern-api/configuration";
import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";

import { generateFdrWithFromOpenapiFlag } from "./generateFdrWithFromOpenapiFlag";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("openapi_fixtures"));

const FIXTURES: Fixture[] = [
    {
        name: "simple"
    }
];

interface Fixture {
    name: string;
    audiences?: string[];
    language?: generatorsYml.GenerationLanguage;
    version?: string;
    only?: boolean;
}

describe("fdr --from-openapi", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name));
                const fdrContents = await generateFdrWithFromOpenapiFlag({
                    fixturePath,
                    language: fixture.language,
                    audiences: fixture.audiences,
                    version: fixture.version
                });
                // biome-ignore lint/suspicious/noMisplacedAssertion: allow
                expect(fdrContents).toMatchSnapshot();
            },
            90_000
        );
    }
});
