import { AbsoluteFilePath } from "@fern-api/fs-utils";
import {
    resolveLinksInMarkdownString,
    resolveLinksInObject,
    updateApiDefinitionIdInTree
} from "../resolveDescriptionLinks.js";

const FERN_FOLDER = AbsoluteFilePath.of("/path/to/fern");

const metadata = {
    absolutePathToFernFolder: FERN_FOLDER,
    absolutePathToMarkdownFile: FERN_FOLDER
};

// Map file paths to slugs, simulating what getReplacedHref resolves
const markdownFilesToPathName: Record<AbsoluteFilePath, string> = {
    [AbsoluteFilePath.of("/path/to/fern/docs/pages/sdks.mdx")]: "/sdks",
    [AbsoluteFilePath.of("/path/to/fern/docs/pages/objects/Order.mdx")]: "/objects/order",
    [AbsoluteFilePath.of("/path/to/fern/docs/pages/guide.md")]: "/guide",
    [AbsoluteFilePath.of("/path/to/fern/docs/pages/getting-started.mdx")]: "/getting-started"
};

describe("resolveLinksInMarkdownString", () => {
    it("resolves .mdx link to slug", () => {
        const input = "See [SDKs](/docs/pages/sdks.mdx) for details";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe("See [SDKs](/sdks) for details");
    });

    it("resolves .md link to slug", () => {
        const input = "Read the [guide](/docs/pages/guide.md)";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe("Read the [guide](/guide)");
    });

    it("resolves link with anchor fragment", () => {
        const input = "See [section](/docs/pages/sdks.mdx#installation)";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe("See [section](/sdks#installation)");
    });

    it("resolves nested path to slug", () => {
        const input = "See [Order](/docs/pages/objects/Order.mdx) object";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe("See [Order](/objects/order) object");
    });

    it("resolves multiple links in one string", () => {
        const input = "See [SDKs](/docs/pages/sdks.mdx) and [Order](/docs/pages/objects/Order.mdx)";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe("See [SDKs](/sdks) and [Order](/objects/order)");
    });

    it("leaves non-markdown strings unchanged", () => {
        const input = "This is a plain string with no links";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe(input);
    });

    it("leaves external URLs unchanged", () => {
        const input = "Visit [docs](https://example.com/docs.mdx)";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe(input);
    });

    it("leaves unresolvable .mdx links unchanged", () => {
        const input = "See [missing](/docs/pages/nonexistent.mdx)";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe(input);
    });

    it("handles empty string", () => {
        const result = resolveLinksInMarkdownString("", markdownFilesToPathName, metadata);
        expect(result).toBe("");
    });

    it("handles string with .md substring but no markdown link syntax", () => {
        const input = "The file README.md is in the root";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe(input);
    });

    it("handles link with empty text", () => {
        const input = "Click [](/docs/pages/sdks.mdx)";
        const result = resolveLinksInMarkdownString(input, markdownFilesToPathName, metadata);
        expect(result).toBe("Click [](/sdks)");
    });
});

describe("resolveLinksInObject", () => {
    it("resolves links in flat object string values", () => {
        const obj = {
            docs: "See [SDKs](/docs/pages/sdks.mdx) for details",
            name: "my-endpoint"
        };
        resolveLinksInObject(obj, markdownFilesToPathName, metadata);
        expect(obj.docs).toBe("See [SDKs](/sdks) for details");
        expect(obj.name).toBe("my-endpoint");
    });

    it("resolves links in nested objects", () => {
        const obj = {
            endpoint: {
                description: "Returns [Order](/docs/pages/objects/Order.mdx) objects",
                parameters: {
                    id: {
                        docs: "See [guide](/docs/pages/guide.md)"
                    }
                }
            }
        };
        resolveLinksInObject(obj, markdownFilesToPathName, metadata);
        expect(obj.endpoint.description).toBe("Returns [Order](/objects/order) objects");
        expect(obj.endpoint.parameters.id.docs).toBe("See [guide](/guide)");
    });

    it("resolves links in arrays", () => {
        const obj = {
            items: [{ docs: "Link to [SDKs](/docs/pages/sdks.mdx)" }, { docs: "Link to [guide](/docs/pages/guide.md)" }]
        };
        resolveLinksInObject(obj, markdownFilesToPathName, metadata);
        expect(obj.items[0]?.docs).toBe("Link to [SDKs](/sdks)");
        expect(obj.items[1]?.docs).toBe("Link to [guide](/guide)");
    });

    it("leaves non-.md strings untouched", () => {
        const obj = {
            name: "my-api",
            version: "1.0.0",
            url: "https://example.com"
        };
        const original = { ...obj };
        resolveLinksInObject(obj, markdownFilesToPathName, metadata);
        expect(obj).toEqual(original);
    });

    it("handles null and undefined values", () => {
        const obj = {
            docs: null,
            other: undefined,
            name: "test"
        };
        resolveLinksInObject(obj, markdownFilesToPathName, metadata);
        expect(obj.docs).toBeNull();
        expect(obj.other).toBeUndefined();
        expect(obj.name).toBe("test");
    });

    it("handles deeply nested structure mimicking IR", () => {
        const ir = {
            services: {
                service_1: {
                    endpoints: [
                        {
                            docs: "Creates a new [Order](/docs/pages/objects/Order.mdx)",
                            path: "/orders",
                            request: {
                                body: {
                                    docs: "See [getting started](/docs/pages/getting-started.mdx#setup)"
                                }
                            }
                        }
                    ]
                }
            },
            types: {
                type_1: {
                    docs: "Represents an [Order](/docs/pages/objects/Order.mdx) entity",
                    properties: [
                        {
                            docs: "The [SDKs](/docs/pages/sdks.mdx) support this field",
                            name: "orderId"
                        }
                    ]
                }
            }
        };
        resolveLinksInObject(ir, markdownFilesToPathName, metadata);
        expect(ir.services["service_1"]?.endpoints[0]?.docs).toBe("Creates a new [Order](/objects/order)");
        expect(ir.services["service_1"]?.endpoints[0]?.request.body.docs).toBe(
            "See [getting started](/getting-started#setup)"
        );
        expect(ir.types["type_1"]?.docs).toBe("Represents an [Order](/objects/order) entity");
        expect(ir.types["type_1"]?.properties[0]?.docs).toBe("The [SDKs](/sdks) support this field");
        expect(ir.types["type_1"]?.properties[0]?.name).toBe("orderId");
    });

    it("does not modify non-object primitives", () => {
        resolveLinksInObject(null, markdownFilesToPathName, metadata);
        resolveLinksInObject(undefined, markdownFilesToPathName, metadata);
        resolveLinksInObject(42, markdownFilesToPathName, metadata);
        resolveLinksInObject("string", markdownFilesToPathName, metadata);
        // Should not throw
    });

    it("resolves links on any key name, not just 'docs'", () => {
        const obj = {
            description: "See [SDKs](/docs/pages/sdks.mdx)",
            summary: "Returns [Order](/docs/pages/objects/Order.mdx)",
            customField: "Check [guide](/docs/pages/guide.md)"
        };
        resolveLinksInObject(obj, markdownFilesToPathName, metadata);
        expect(obj.description).toBe("See [SDKs](/sdks)");
        expect(obj.summary).toBe("Returns [Order](/objects/order)");
        expect(obj.customField).toBe("Check [guide](/guide)");
    });
});

describe("updateApiDefinitionIdInTree", () => {
    it("replaces apiDefinitionId in flat node", () => {
        const node = { apiDefinitionId: "old-id", name: "test" };
        updateApiDefinitionIdInTree(node, "old-id", "new-id");
        expect(node.apiDefinitionId).toBe("new-id");
        expect(node.name).toBe("test");
    });

    it("replaces apiDefinitionId in nested nodes", () => {
        const tree = {
            children: [
                { apiDefinitionId: "old-id", type: "endpoint" },
                { apiDefinitionId: "old-id", type: "webhook" },
                { apiDefinitionId: "other-id", type: "endpoint" }
            ]
        };
        updateApiDefinitionIdInTree(tree, "old-id", "new-id");
        expect(tree.children[0]?.apiDefinitionId).toBe("new-id");
        expect(tree.children[1]?.apiDefinitionId).toBe("new-id");
        expect(tree.children[2]?.apiDefinitionId).toBe("other-id");
    });

    it("does not modify unrelated values", () => {
        const node = { apiDefinitionId: "keep-me", other: "old-id" };
        updateApiDefinitionIdInTree(node, "old-id", "new-id");
        expect(node.apiDefinitionId).toBe("keep-me");
        expect(node.other).toBe("old-id");
    });

    it("handles null and undefined", () => {
        updateApiDefinitionIdInTree(null, "old", "new");
        updateApiDefinitionIdInTree(undefined, "old", "new");
        // Should not throw
    });
});
