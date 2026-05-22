import path from "path";

import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { RelativeFilePath } from "../RelativeFilePath.js";
import { relativePathForDisplay } from "../relativePathForDisplay.js";

describe("relativePathForDisplay", () => {
    it("returns a relative path when one can be represented", () => {
        expect(
            relativePathForDisplay(
                AbsoluteFilePath.of("/path/to/fern"),
                AbsoluteFilePath.of("/path/to/fern/openapi.yml")
            )
        ).toEqual(RelativeFilePath.of("openapi.yml"));
    });

    it("returns the basename for Windows cross-drive paths", () => {
        expect(
            relativePathForDisplay(
                "D:\\workspace\\fern" as AbsoluteFilePath,
                "C:\\Users\\spec\\openapi.yml" as AbsoluteFilePath,
                path.win32
            )
        ).toEqual(RelativeFilePath.of("openapi.yml"));
    });
});
