import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { GenerationLanguage } from "@fern-api/generators-configuration";
import { generateIrAsString } from "./generateIrAsString";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), "fixtures");

const FIXTURES: Fixture[] = [
    {
        name: "nested-example-reference",
    },
    {
        name: "simple",
    },
    {
        name: "simple",
        audiences: ["test"],
    },
    {
        name: "extended-examples",
    },
    {
        name: "packages",
    },
    {
        name: "multiple-environment-urls",
    },
];

interface Fixture {
    name: string;
    audiences?: string[];
}

describe("ir", () => {
    for (const fixture of FIXTURES) {
        itFixture(fixture.name);
        for (const language of Object.values(GenerationLanguage)) {
            itFixture(fixture.name, language, fixture.audiences);
        }
    }
});

function itFixture(fixtureName: string, language?: GenerationLanguage, audiences?: string[]) {
    it(`${JSON.stringify({ fixtureName, language, audiences })}`, async () => {
        const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName));
        const irContents = await generateIrAsString({ fixturePath, language, audiences });
        expect(irContents).toMatchSnapshot();
    }, 90_000);
}
