import { generateModels } from "../generateModels";
import { createSampleGeneratorContext } from "./createSampleGeneratorContext";

describe("generateModels", () => {
    it("should generate models", async () => {
        const fixtureName = "basic-object";
        const context = await createSampleGeneratorContext(fixtureName);
        const files = generateModels({ context });
        for (const file of files) {
            expect(file.fileContents).toMatchFileSnapshot(`snapshots/${fixtureName}/${file.filename}`);
        }
    });
});
