import path from "path";

import { AbsoluteFilePath } from "../AbsoluteFilePath.js";
import { RelativeFilePath } from "../RelativeFilePath.js";
import { relativeOrOriginalPath } from "../relativeOrOriginalPath.js";

describe("relativeOrOriginalPath", () => {
    it("returns a relative path when one can be represented", () => {
        expect(
            relativeOrOriginalPath(
                AbsoluteFilePath.of("/path/to/fern"),
                AbsoluteFilePath.of("/path/to/fern/openapi.yml")
            )
        ).toEqual(RelativeFilePath.of("openapi.yml"));
    });

    it("returns the original absolute path for Windows cross-drive paths", () => {
        expect(
            relativeOrOriginalPath(
                "D:\\workspace\\fern" as AbsoluteFilePath,
                "C:\\Users\\spec\\openapi.yml" as AbsoluteFilePath,
                path.win32
            )
        ).toEqual("C:\\Users\\spec\\openapi.yml" as AbsoluteFilePath);
    });
});
