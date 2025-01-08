/* eslint-disable jest/expect-expect */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { AbsoluteFilePath } from "../AbsoluteFilePath";
import { join } from "../join";

describe("join", () => {
    it("should not compile when first path is absolute and non-first path is absolute", () => {
        // @ts-expect-error
        () => join("/a", "b/c", "/d");
    });

    it("should not compile when first path is relative and non-first path is absolute", () => {
        // @ts-expect-error
        () => join("a", "b/c", "/d");
    });

    it("should not compile when first path is relative and non-first path is just a string", () => {
        const justAString = ((): string => "hello")();
        // @ts-expect-error
        () => join("a", justAString);
    });

    it("should not compile when first path is absolute and non-first path is just a string", () => {
        const justAString = ((): string => "hello")();
        // @ts-expect-error
        () => join("/a", justAString);
    });

    it("should not compile when first path is an AbsoluteFilePath and non-first path is an AbsoluteFilePath", () => {
        // @ts-expect-error
        () => join(AbsoluteFilePath.of("/a"), "b/c", AbsoluteFilePath.of("/d"));
    });

    it("should not compile when first path is a RelativeFilePath and non-first path is an AbsoluteFilePath", () => {
        // @ts-expect-error
        () => join("a", "b/c", AbsoluteFilePath.of("/d"));
    });

    it("should not compile when first path is a RelativeFilePath and non-first path is just a string", () => {
        const justAString = ((): string => "hello")();
        // @ts-expect-error
        () => join("a", justAString);
    });

    it("should not compile when first path is an AbsoluteFilePath and non-first path is just a string", () => {
        const justAString = ((): string => "hello")();
        // @ts-expect-error
        join(AbsoluteFilePath.of("/a"), justAString);
    });
});
