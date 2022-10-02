import { FernFilepath } from "@fern-fern/ir-model/commons";
import { convertToFernFilepath } from "../utils/convertToFernFilepath";

describe("convertToFernFilepath", () => {
    it("post.yml", () => {
        const expected: FernFilepath = [
            {
                originalValue: "posts",
                camelCase: "posts",
                snakeCase: "posts",
                pascalCase: "Posts",
                screamingSnakeCase: "POSTS",
            },
        ];
        expect(convertToFernFilepath("posts.yml")).toEqual(expected);
    });

    it("a/b.yml", () => {
        const expected: FernFilepath = [
            {
                originalValue: "a",
                camelCase: "a",
                snakeCase: "a",
                pascalCase: "A",
                screamingSnakeCase: "A",
            },
            {
                originalValue: "b",
                camelCase: "b",
                snakeCase: "b",
                pascalCase: "B",
                screamingSnakeCase: "B",
            },
        ];
        expect(convertToFernFilepath("a/b.yml")).toEqual(expected);
    });

    it("a/b/c.yml", () => {
        const expected: FernFilepath = [
            {
                originalValue: "a",
                camelCase: "a",
                snakeCase: "a",
                pascalCase: "A",
                screamingSnakeCase: "A",
            },
            {
                originalValue: "b",
                camelCase: "b",
                snakeCase: "b",
                pascalCase: "B",
                screamingSnakeCase: "B",
            },
            {
                originalValue: "c",
                camelCase: "c",
                snakeCase: "c",
                pascalCase: "C",
                screamingSnakeCase: "C",
            },
        ];
        expect(convertToFernFilepath("a/b/c.yml")).toEqual(expected);
    });
});
