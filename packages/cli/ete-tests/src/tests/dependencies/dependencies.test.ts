import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { generateIrAsString } from "../ir/generateIrAsString";

const FIXTURES_DIR = join(AbsoluteFilePath.of(__dirname), "fixtures");

describe("dependencies", () => {
    it("correctly incorporates dependencies", async () => {
        const ir = await generateIrAsString({
            fixturePath: join(FIXTURES_DIR, RelativeFilePath.of("simple")),
            apiName: "dependent",
        });
        expect(ir).toMatchSnapshot();
    });
});
