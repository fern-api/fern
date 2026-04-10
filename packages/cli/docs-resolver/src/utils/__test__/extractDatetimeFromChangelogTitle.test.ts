import { extractDatetimeFromChangelogTitle } from "../extractDatetimeFromChangelogTitle.js";

describe("extractDatetimeFromChangelogTitle", () => {
    it("basic", () => {
        const parsedDate = extractDatetimeFromChangelogTitle("2021-01-01.md");
        expect(parsedDate).toEqual(new Date("2021-01-01"));
    });
});
