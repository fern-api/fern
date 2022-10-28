import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { Language } from "@fern-api/ir-generator";
import { generateIrAsString } from "./generateIrAsString";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), "fixtures");

const FIXTURES = ["simple"];

describe("ir", () => {
    for (const fixtureName of FIXTURES) {
        itFixture(fixtureName);
        for (const language of Object.values(Language)) {
            itFixture(fixtureName, language);
        }
    }
});

function itFixture(fixtureName: string, language?: Language) {
    it(
        // eslint-disable-next-line jest/valid-title
        fixtureName,
        async () => {
            const fixturePath = join(FIXTURES_DIR, RelativeFilePath.of(fixtureName));
            const irContents = await generateIrAsString({ fixturePath, language });
            expect(irContents).toMatchSnapshot();
        },
        90_000
    );
}
