import { UrlSlugTree } from "../UrlSlugTree";
import { MOCKS_DOCS_DEFINITION } from "./mocks";

describe("UrlSlugTree", () => {
    describe("getAllSlugs", () => {
        it("correctly determines all slugs", () => {
            const tree = new UrlSlugTree(MOCKS_DOCS_DEFINITION);

            const expectedSlugs = [
                "introduction",
                "introduction/api-responses",
                "introduction/authentication",
                "introduction/getting-started",
                "introduction/idempotency-key",
                "introduction/loyalty-transactions",
            ];
            const actualSlugs = tree.getAllSlugs().sort();

            expect(actualSlugs).toEqual(expectedSlugs);
        });
    });
});
