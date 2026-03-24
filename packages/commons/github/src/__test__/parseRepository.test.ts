import { parseRepository } from "../parseRepository.js";

describe("parseRepository", () => {
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

    it("full URL produces correct owner and repo (FER-9146)", async () => {
        // Previously, code used uri.split("/") which would produce
        // owner = "https:" and repo = "" for full URLs.
        const reference = parseRepository("https://github.com/anduril/lattice-sdk-javascript");
        expect(reference.owner).toBe("anduril");
        expect(reference.repo).toBe("lattice-sdk-javascript");
        expect(reference.repoUrl).toBe("https://github.com/anduril/lattice-sdk-javascript");
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
