import { generateModels } from "../generateModels";
import { createSampleGeneratorContext } from "./createSampleGeneratorContext";

describe("generateModels", () => {
    it("should generate models", () => {
        const context = createSampleGeneratorContext();
        const files = generateModels({ context });
        expect(files).toMatchSnapshot();
    });
});
