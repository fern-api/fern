import * as FernRegistryDocsRead from "@fern-fern/registry-browser/api/resources/docs/resources/v1/resources/read";

export const MOCKS_DOCS_DEFINITION: FernRegistryDocsRead.DocsDefinition = {
    pages: {},
    apis: {},
    files: {},
    config: {
        navbarLinks: [],
        navigation: {
            items: [
                {
                    type: "section",
                    title: "Introduction",
                    urlSlug: "introduction",
                    items: [
                        {
                            type: "page",
                            id: FernRegistryDocsRead.PageId("introduction/getting-started.md"),
                            title: "Getting Started",
                            urlSlug: "getting-started",
                        },
                        {
                            type: "page",
                            id: FernRegistryDocsRead.PageId("introduction/authentication.md"),
                            title: "Authentication",
                            urlSlug: "authentication",
                        },
                        {
                            type: "page",
                            id: FernRegistryDocsRead.PageId("introduction/responses.md"),
                            title: "API Responses",
                            urlSlug: "api-responses",
                        },
                        {
                            type: "page",
                            id: FernRegistryDocsRead.PageId("introduction/idempotency-key.md"),
                            title: "Idempotency Key",
                            urlSlug: "idempotency-key",
                        },
                        {
                            type: "page",
                            id: FernRegistryDocsRead.PageId("loyalty-api/loyalty-transactions.md"),
                            title: "Loyalty Transactions",
                            urlSlug: "loyalty-transactions",
                        },
                    ],
                },
            ],
        },
    },
};
