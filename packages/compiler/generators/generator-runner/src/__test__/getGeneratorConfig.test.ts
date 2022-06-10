import { getGeneratorOutputConfig } from "../getGeneratorConfig";

describe("getGeneratorOutputConfig", () => {
    it("path relative to root", () => {
        const outputConfig = getGeneratorOutputConfig({
            absolutePathToProject: "/path/to/root",
            absolutePathToOutput: "/path/to/root/path/to/output",
        });
        expect(outputConfig?.pathRelativeToRootOnHost).toEqual("path/to/output");
    });

    it("no path relative to root", () => {
        const outputConfig = getGeneratorOutputConfig({
            absolutePathToProject: undefined,
            absolutePathToOutput: "/path/to/root/path/to/output",
        });
        expect(outputConfig?.pathRelativeToRootOnHost).toEqual(null);
    });

    it("no output path", () => {
        const outputConfig = getGeneratorOutputConfig({
            absolutePathToProject: "/path/to/root",
            absolutePathToOutput: undefined,
        });
        expect(outputConfig).toBeNull();
    });
});
