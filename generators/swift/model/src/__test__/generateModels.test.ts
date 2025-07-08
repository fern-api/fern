import { generateModels } from "../generateModels";
import { createSampleGeneratorContext } from "./util/createSampleGeneratorContext";

describe("generateModels", () => {
    it("should generate models", async () => {
        const testDefinitionName = "basic-object";
        const context = await createSampleGeneratorContext(testDefinitionName);
        const files = generateModels({ context });
        for (const file of files) {
            expect(file.fileContents).toMatchFileSnapshot(`snapshots/${testDefinitionName}/${file.filename}`);
        }
    });
});
