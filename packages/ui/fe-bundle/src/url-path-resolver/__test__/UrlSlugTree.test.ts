import { isVersionedNavigationConfig } from "../../utils/docs";
import { UrlSlugTree } from "../UrlSlugTree";
import { MOCKS_DOCS_DEFINITION } from "./mocks";

describe("UrlSlugTree", () => {
    describe("getAllSlugs", () => {
        it("correctly determines all slugs", () => {
            if (isVersionedNavigationConfig(MOCKS_DOCS_DEFINITION.config.navigation)) {
                throw new Error("Text expects an unversioned navigation config");
            }
            const tree = new UrlSlugTree({
                loadApiDefinition: (id) => MOCKS_DOCS_DEFINITION.apis[id],
                navigation: MOCKS_DOCS_DEFINITION.config.navigation,
            });

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
