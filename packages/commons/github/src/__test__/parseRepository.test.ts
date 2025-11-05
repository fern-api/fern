import { parseRepository } from "../parseRepository";

describe("getLatestTag", () => {
    it("fern-api/fern", async () => {
        const tests = [
            "fern-api/fern",
            "github.com/fern-api/fern",
            "https://github.com/fern-api/fern",
            "https://github.com/fern-api/fern.git"
        ];
        for (const test of tests) {
            const reference = parseRepository(test);
            expect(reference.remote).toBe("github.com");
            expect(reference.owner).toBe("fern-api");
            expect(reference.repo).toBe("fern");
            expect(reference.repoUrl).toBe("https://github.com/fern-api/fern");
            expect(reference.cloneUrl).toBe("https://github.com/fern-api/fern.git");
            expect(reference.getAuthedCloneUrl("xyz")).toBe("https://x-access-token:xyz@github.com/fern-api/fern.git");
        }
    });
    it("invalid structure", async () => {
        expect(() => {
            parseRepository("fern");
        }).toThrow(Error);
    });
    it("too many slashes", async () => {
        expect(() => {
            parseRepository("github.com/fern-api//fern");
        }).toThrow(Error);
    });

    it("custom github domain", async () => {
        const test = "https://github.acme.com/engineering/api-client-sdk.git";
        const reference = parseRepository(test);
        expect(reference.remote).toBe("github.acme.com");
        expect(reference.owner).toBe("engineering");
        expect(reference.repo).toBe("api-client-sdk");
        expect(reference.repoUrl).toBe("https://github.acme.com/engineering/api-client-sdk");
        expect(reference.cloneUrl).toBe("https://github.acme.com/engineering/api-client-sdk.git");
        expect(reference.getAuthedCloneUrl("xyz")).toBe(
            "https://x-access-token:xyz@github.acme.com/engineering/api-client-sdk.git"
        );
    });
});
