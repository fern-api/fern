import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { RelativeFilePath } from "../RelativeFilePath.js";
import { resolveConfiguredFilepath, resolveConfiguredFilepaths } from "../resolveConfiguredFilepath.js";

describe("resolveConfiguredFilepath", () => {
    it("joins relative paths against the workspace", () => {
        expect(
            resolveConfiguredFilepath({
                absolutePathToWorkspace: AbsoluteFilePath.of("/path/to/fern"),
                configuredFilepath: "openapi/openapi.yml"
            })
        ).toEqual(AbsoluteFilePath.of("/path/to/fern/openapi/openapi.yml"));
    });

    it("returns absolute paths unchanged", () => {
        expect(
            resolveConfiguredFilepath({
                absolutePathToWorkspace: AbsoluteFilePath.of("/path/to/fern"),
                configuredFilepath: "/Users/spec/openapi.yml"
            })
        ).toEqual(AbsoluteFilePath.of("/Users/spec/openapi.yml"));
    });
});

describe("resolveConfiguredFilepaths", () => {
    it("resolves arrays of relative and absolute paths", () => {
        expect(
            resolveConfiguredFilepaths({
                absolutePathToWorkspace: AbsoluteFilePath.of("/path/to/fern"),
                configuredFilepaths: ["overrides/a.yml", "/Users/spec/overrides/b.yml"]
            })
        ).toEqual([
            AbsoluteFilePath.of("/path/to/fern/overrides/a.yml"),
            AbsoluteFilePath.of("/Users/spec/overrides/b.yml")
        ]);
    });
});
