import { SymbolGraph } from "../symbol-graph";

describe("SymbolGraph", () => {
    function setupRegistry() {
        const registry = new SymbolGraph();
        // Swift
        const swiftModule = registry.createModuleSymbol({ symbolId: "Swift", symbolName: "Swift" });
        const swiftStringType = registry.createTypeSymbol({
            symbolId: "Swift.String",
            symbolName: "String"
        });
        registry.nestSymbol({ parentSymbolId: swiftModule.id, childSymbolId: swiftStringType.id });
        const swiftIntType = registry.createTypeSymbol({
            symbolId: "Swift.Int",
            symbolName: "Int"
        });
        registry.nestSymbol({ parentSymbolId: swiftModule.id, childSymbolId: swiftIntType.id });
        const swiftBoolType = registry.createTypeSymbol({
            symbolId: "Swift.Bool",
            symbolName: "Bool"
        });
        registry.nestSymbol({ parentSymbolId: swiftModule.id, childSymbolId: swiftBoolType.id });

        // Foundation
        const foundationModule = registry.createModuleSymbol({
            symbolId: "Foundation",
            symbolName: "Foundation"
        });
        const foundationURLType = registry.createTypeSymbol({
            symbolId: "Foundation.URL",
            symbolName: "URL"
        });
        registry.nestSymbol({ parentSymbolId: foundationModule.id, childSymbolId: foundationURLType.id });
        const foundationDateType = registry.createTypeSymbol({
            symbolId: "Foundation.Date",
            symbolName: "Date"
        });
        registry.nestSymbol({ parentSymbolId: foundationModule.id, childSymbolId: foundationDateType.id });
        const foundationDataType = registry.createTypeSymbol({
            symbolId: "Foundation.Data",
            symbolName: "Data"
        });
        registry.nestSymbol({ parentSymbolId: foundationModule.id, childSymbolId: foundationDataType.id });

        // Client module and types
        const clientModule = registry.createModuleSymbol({ symbolId: "Module", symbolName: "Acme" });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Swift" });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Foundation" });

        const userType = registry.createTypeSymbol({ symbolId: "Module.User", symbolName: "User" });
        registry.nestSymbol({ parentSymbolId: clientModule.id, childSymbolId: userType.id });
        const postType = registry.createTypeSymbol({ symbolId: "Module.Post", symbolName: "Post" });
        registry.nestSymbol({ parentSymbolId: clientModule.id, childSymbolId: postType.id });
        const postDateType = registry.createTypeSymbol({
            symbolId: "Module.Post.Date",
            symbolName: "Date"
        });
        registry.nestSymbol({ parentSymbolId: postType.id, childSymbolId: postDateType.id });
        const postCommentType = registry.createTypeSymbol({
            symbolId: "Module.Post.Comment",
            symbolName: "Comment"
        });
        registry.nestSymbol({ parentSymbolId: postType.id, childSymbolId: postCommentType.id });

        return registry;
    }

    it("resolves Foundation.Date from Module.User to 'Date'", () => {
        const registry = setupRegistry();
        expect(
            registry.reference({
                fromSymbolId: "Module.User",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Date");
    });

    it("resolves Module.Post.Date from Module.Post to 'Date'", () => {
        const registry = setupRegistry();
        expect(
            registry.reference({
                fromSymbolId: "Module.Post",
                targetSymbolId: "Module.Post.Date"
            })
        ).toBe("Date");
    });

    it("resolves Foundation.Date from Module.Post to 'Foundation.Date' due to shadow", () => {
        const registry = setupRegistry();
        expect(
            registry.reference({
                fromSymbolId: "Module.Post",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Foundation.Date");
    });

    it("resolves Foundation.Date from Module.User to 'Foundation.Date' when another import exposes Date", () => {
        const registry = setupRegistry();
        const otherModule = registry.createModuleSymbol({ symbolId: "Other", symbolName: "Other" });
        const otherDate = registry.createTypeSymbol({ symbolId: "Other.Date", symbolName: "Date" });
        registry.nestSymbol({ parentSymbolId: otherModule.id, childSymbolId: otherDate.id });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Other" });
        expect(
            registry.reference({
                fromSymbolId: "Module.User",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Foundation.Date");
    });

    // New tests for resolveReference(from, reference: string)
    it("resolveReference(from, 'Date') resolves to Foundation.Date from Module.User", () => {
        const registry = setupRegistry();
        const resolved = registry.resolveReference({ fromSymbolId: "Module.User", reference: "Date" });
        expect(resolved?.id).toBe("Foundation.Date");
    });

    it("resolveReference(from, 'Post.Date') resolves to Module.Post.Date from Module.User", () => {
        const registry = setupRegistry();
        const resolved = registry.resolveReference({ fromSymbolId: "Module.User", reference: "Post.Date" });
        expect(resolved?.id).toBe("Module.Post.Date");
    });

    it("resolveReference(from, 'Foundation.Date') resolves to Foundation.Date from Module.User", () => {
        const registry = setupRegistry();
        const resolved = registry.resolveReference({ fromSymbolId: "Module.User", reference: "Foundation.Date" });
        expect(resolved?.id).toBe("Foundation.Date");
    });

    it("resolveReference returns null for ambiguous single-segment across imports", () => {
        const registry = setupRegistry();
        const otherModule = registry.createModuleSymbol({ symbolId: "Other", symbolName: "Other" });
        const otherDate = registry.createTypeSymbol({ symbolId: "Other.Date", symbolName: "Date" });
        registry.nestSymbol({ parentSymbolId: otherModule.id, childSymbolId: otherDate.id });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Other" });
        const resolved = registry.resolveReference({ fromSymbolId: "Module.User", reference: "Date" });
        expect(resolved).toBeNull();
    });
});
