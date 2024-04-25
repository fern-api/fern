import { parseImagePaths } from "../parseImagePaths";

describe("parseImagePaths", () => {
    it("should return an empty array if there are no images", () => {
        const page = "This is a test page";
        const result = parseImagePaths(page);
        expect(result).toEqual([]);
    });

    it("should return an array of image paths", () => {
        const page = "This is a test page with an image ![image](path/to/image.png)";
        const result = parseImagePaths(page);
        expect(result).toEqual(["path/to/image.png"]);
    });

    it("should return an array of image paths with multiple images", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image1.png) and another image ![image2](path/to/image2.png)";
        const result = parseImagePaths(page);
        expect(result).toEqual(["path/to/image1.png", "path/to/image2.png"]);
    });

    it("should return an array of image paths with multiple images of the same path", () => {
        const page =
            "This is a test page with an image ![image1](path/to/image.png) and another image ![image2](path/to/image.png)";
        const result = parseImagePaths(page);
        expect(result).toEqual(["path/to/image.png"]);
    });

    it("should return an array of image paths from html image tags", () => {
        const page = "This is a test page with an image <img src='path/to/image.png' />";
        const result = parseImagePaths(page);
        expect(result).toEqual(["path/to/image.png"]);
    });
});
