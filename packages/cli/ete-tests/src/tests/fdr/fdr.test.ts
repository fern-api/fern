import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { generateFdrAsString } from "./generateFdrAsString";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), RelativeFilePath.of("fixtures"));

const FIXTURES: Fixture[] = [
    {
        name: "simple",
    },
];

interface Fixture {
    name: string;
    audiences?: string[];
    language?: GenerationLanguage;
    version?: string;
    only?: boolean;
}

describe("fdr", () => {
    for (const fixture of FIXTURES) {
        const { only = false } = fixture;
        (only ? it.only : it)(
            `${JSON.stringify(fixture)}`,
            async () => {
                const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixture.name));
                const fdrContents = await generateFdrAsString({
                    fixturePath,
                    language: fixture.language,
                    audiences: fixture.audiences,
                    version: fixture.version,
                });
                // eslint-disable-next-line jest/no-standalone-expect
                expect(fdrContents).toMatchSnapshot();
            },
            90_000
        );
    }
});
