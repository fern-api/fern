import { capitalizeFirstLetter } from "../capitalizeFirstLetter.js";

describe("capitalizeFirstLetter", () => {
    it("uppercases only the first character", () => {
        expect(capitalizeFirstLetter("hello")).toBe("Hello");
        expect(capitalizeFirstLetter("helloWorld")).toBe("HelloWorld");
        expect(capitalizeFirstLetter("HELLO")).toBe("HELLO");
    });

    it("returns an empty string unchanged", () => {
        expect(capitalizeFirstLetter("")).toBe("");
    });

    it("leaves a non-letter first character alone", () => {
        expect(capitalizeFirstLetter("1abc")).toBe("1abc");
    });
});
