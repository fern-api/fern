import path from "path";

import { toPosixPath } from "../toPosixPath.js";

describe("toPosixPath", () => {
    it("joins path segments with forward slashes", () => {
        expect(toPosixPath(["a", "b", "c.txt"].join(path.sep))).toBe("a/b/c.txt");
    });

    it("leaves a path without separators alone", () => {
        expect(toPosixPath("file.txt")).toBe("file.txt");
    });
});
