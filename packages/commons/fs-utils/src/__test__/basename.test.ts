
/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/ban-ts-comment */

import { basename } from "../basename";

describe("basename", () => {
    it("should extract a directory when the directory is the last item in the path", () => {
        expect(basename("/a/b/c")).toEqual("c");
    });

    it("should extract a file name  when the file is the last item in the path", () => {
        expect(basename("/a/b/c.txt")).toEqual("c.txt");
    });

    it("should not extract anything when the path is empty", () => {
        expect(basename("")).toEqual("");
    });
});
