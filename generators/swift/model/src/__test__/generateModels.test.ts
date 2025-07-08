import { generateModels } from "../generateModels";
import { createSampleGeneratorContext } from "./createSampleGeneratorContext";

describe("generateModels", () => {
    it("should generate models", async () => {
        const context = await createSampleGeneratorContext("basic-object");
        const files = generateModels({ context });
        expect(files).toMatchSnapshot();
    });
});
