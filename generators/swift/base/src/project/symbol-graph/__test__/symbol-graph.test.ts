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
        swiftModule.setChild(swiftStringType);
        const swiftIntType = registry.createTypeSymbol({
            symbolId: "Swift.Int",
            symbolName: "Int"
        });
        swiftModule.setChild(swiftIntType);
        const swiftBoolType = registry.createTypeSymbol({
            symbolId: "Swift.Bool",
            symbolName: "Bool"
        });
        swiftModule.setChild(swiftBoolType);

        // Foundation
        const foundationModule = registry.createModuleSymbol({
            symbolId: "Foundation",
            symbolName: "Foundation"
        });
        const foundationURLType = registry.createTypeSymbol({
            symbolId: "Foundation.URL",
            symbolName: "URL"
        });
        foundationModule.setChild(foundationURLType);
        const foundationDateType = registry.createTypeSymbol({
            symbolId: "Foundation.Date",
            symbolName: "Date"
        });
        foundationModule.setChild(foundationDateType);
        const foundationDataType = registry.createTypeSymbol({
            symbolId: "Foundation.Data",
            symbolName: "Data"
        });
        foundationModule.setChild(foundationDataType);

        // Client module and types
        const clientModule = registry.createModuleSymbol({ symbolId: "Module", symbolName: "Acme" });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Swift" });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Foundation" });

        const userType = registry.createTypeSymbol({ symbolId: "Module.User", symbolName: "User" });
        clientModule.setChild(userType);
        const postType = registry.createTypeSymbol({ symbolId: "Module.Post", symbolName: "Post" });
        clientModule.setChild(postType);
        const postDateType = registry.createTypeSymbol({
            symbolId: "Module.Post.Date",
            symbolName: "Date"
        });
        postType.setChild(postDateType);
        const postCommentType = registry.createTypeSymbol({
            symbolId: "Module.Post.Comment",
            symbolName: "Comment"
        });
        postType.setChild(postCommentType);

        return registry;
    }

    it("resolves Foundation.Date from Module.User to 'Date'", () => {
        const registry = setupRegistry();
        expect(
            registry.resolveReference({
                fromSymbolId: "Module.User",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Date");
    });

    it("resolves Module.Post.Date from Module.Post to 'Date'", () => {
        const registry = setupRegistry();
        expect(
            registry.resolveReference({
                fromSymbolId: "Module.Post",
                targetSymbolId: "Module.Post.Date"
            })
        ).toBe("Date");
    });

    it("resolves Foundation.Date from Module.Post to 'Foundation.Date' due to shadow", () => {
        const registry = setupRegistry();
        expect(
            registry.resolveReference({
                fromSymbolId: "Module.Post",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Foundation.Date");
    });

    it("resolves Foundation.Date from Module.User to 'Foundation.Date' when another import exposes Date", () => {
        const registry = setupRegistry();
        const otherModule = registry.createModuleSymbol({ symbolId: "Other", symbolName: "Other" });
        const otherDate = registry.createTypeSymbol({ symbolId: "Other.Date", symbolName: "Date" });
        otherModule.setChild(otherDate);
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Other" });
        expect(
            registry.resolveReference({
                fromSymbolId: "Module.User",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Foundation.Date");
    });
});
