import { describe, expect, it } from "vitest";

import { formatNavigationConfigError } from "../docsAst/formatNavigationConfigError.js";

describe("formatNavigationConfigError", () => {
    it("adds tab and section names for nested navigation errors", () => {
        const message = formatNavigationConfigError({
            value: {
                navigation: [
                    {
                        tab: "functions",
                        layout: [
                            {
                                page: "Overview",
                                path: "overview.mdx"
                            },
                            {
                                section: "Regular functions",
                                "skip-slug": true,
                                collapsed: true,
                                contents: []
                            }
                        ]
                    }
                ]
            },
            error: {
                keyword: "anyOf",
                instancePath: "/navigation/0/layout/1",
                schemaPath: "#/definitions/docs.NavigationItem/anyOf",
                params: {},
                message: "Invalid object at path $.navigation[0].layout[1]: does not match any allowed schema"
            }
        });

        expect(message).toBe(
            "Invalid object at path $.navigation[0].layout[1]: does not match any allowed schema at /navigation/0/layout/1 (/functions/Regular functions/)"
        );
    });

    it("does not add breadcrumbs for non-navigation errors", () => {
        const message = formatNavigationConfigError({
            value: {
                navigation: []
            },
            error: {
                keyword: "type",
                instancePath: "/colors/accent",
                schemaPath: "#/properties/colors",
                params: {},
                message: "Incorrect type at path $.colors.accent"
            }
        });

        expect(message).toBe("Incorrect type at path $.colors.accent at /colors/accent");
    });

    it("adds nested page names for deeply nested navigation errors", () => {
        const message = formatNavigationConfigError({
            value: {
                navigation: [
                    {
                        tab: "functions",
                        layout: [
                            {
                                section: "Regular functions",
                                contents: [
                                    {
                                        page: "Create user",
                                        unknown: true
                                    }
                                ]
                            }
                        ]
                    }
                ]
            },
            error: {
                keyword: "anyOf",
                instancePath: "/navigation/0/layout/0/contents/0",
                schemaPath: "#/definitions/docs.NavigationItem/anyOf",
                params: {},
                message:
                    "Invalid object at path $.navigation[0].layout[0].contents[0]: does not match any allowed schema"
            }
        });

        expect(message).toBe(
            "Invalid object at path $.navigation[0].layout[0].contents[0]: does not match any allowed schema at /navigation/0/layout/0/contents/0 (/functions/Regular functions/Create user/)"
        );
    });

    it("does not include the root docs title in navigation breadcrumbs", () => {
        const message = formatNavigationConfigError({
            value: {
                title: "My API",
                navigation: [
                    {
                        tab: "functions",
                        layout: [
                            {
                                page: "Overview",
                                unknown: true
                            }
                        ]
                    }
                ]
            },
            error: {
                keyword: "anyOf",
                instancePath: "/navigation/0/layout/0",
                schemaPath: "#/definitions/docs.NavigationItem/anyOf",
                params: {},
                message: "Invalid object at path $.navigation[0].layout[0]: does not match any allowed schema"
            }
        });

        expect(message).toBe(
            "Invalid object at path $.navigation[0].layout[0]: does not match any allowed schema at /navigation/0/layout/0 (/functions/Overview/)"
        );
    });
});
