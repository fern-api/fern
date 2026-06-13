import { RelativeFilePath } from "@fern-api/fs-utils";
import path from "path";

import { getRelativeOpenAPIFilePathForWorkspace } from "../createWorkspace.js";

describe("getRelativeOpenAPIFilePathForWorkspace", () => {
    it("returns a relative OpenAPI path when one can be represented", () => {
        expect(
            getRelativeOpenAPIFilePathForWorkspace({
                directoryOfWorkspace: "/path/to/fern",
                openAPIFilePath: "/path/to/fern/openapi.yaml",
                pathModule: path.posix
            })
        ).toEqual(RelativeFilePath.of("openapi.yaml"));
    });

    it("returns undefined when Windows paths are on different drives", () => {
        expect(
            getRelativeOpenAPIFilePathForWorkspace({
                directoryOfWorkspace: "D:\\workspace\\fern",
                openAPIFilePath: "C:\\Users\\ALEXAN~1\\AppData\\Local\\Temp\\openapi.yaml",
                pathModule: path.win32
            })
        ).toBeUndefined();
    });
});
