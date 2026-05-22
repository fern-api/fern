import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { RelativeFilePath } from "../RelativeFilePath.js";
import { resolveConfiguredFilepath } from "../resolveConfiguredFilepath.js";

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
