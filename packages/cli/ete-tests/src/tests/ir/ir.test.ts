import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Language } from "@fern-api/ir-generator";
import { generateIrAsString } from "./generateIrAsString";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), "fixtures");

const FIXTURES: Fixture[] = [
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
];

interface Fixture {
    name: string;
    audiences?: string[];
}

describe("ir", () => {
    for (const fixture of FIXTURES) {
        itFixture(fixture.name);
        for (const language of Object.values(Language)) {
            itFixture(fixture.name, language, fixture.audiences);
        }
    }
});

function itFixture(fixtureName: string, language?: Language, audiences?: string[]) {
    it(// eslint-disable-next-line jest/valid-title
    `${JSON.stringify({ fixtureName, language, audiences })}`, async () => {
        const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName));
        const irContents = await generateIrAsString({ fixturePath, language, audiences });
        expect(irContents).toMatchSnapshot();
    }, 90_000);
}
