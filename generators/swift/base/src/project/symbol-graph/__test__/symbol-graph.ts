import { SymbolGraph } from "../symbol-graph";

describe("SymbolGraph", () => {
    it("resolveReference", () => {
        const registry = new SymbolGraph();
        // Swift
        const swiftModule = registry.createModuleSymbol({ symbolId: "Swift", symbolName: "Swift" });
        const swiftStringType = registry.createTypeSymbol({
            symbolId: "Swift:String",
            symbolName: "String"
        });
        swiftModule.setChild(swiftStringType);
        const swiftIntType = registry.createTypeSymbol({
            symbolId: "Swift:Int",
            symbolName: "Int"
        });
        swiftModule.setChild(swiftIntType);
        const swiftBoolType = registry.createTypeSymbol({
            symbolId: "Swift:Bool",
            symbolName: "Bool"
        });
        swiftModule.setChild(swiftBoolType);

        // Foundation
        const foundationModule = registry.createModuleSymbol({
            symbolId: "Foundation",
            symbolName: "Foundation"
        });
        const foundationURLType = registry.createTypeSymbol({
            symbolId: "Foundation:URL",
            symbolName: "URL"
        });
        foundationModule.setChild(foundationURLType);
        const foundationDateType = registry.createTypeSymbol({
            symbolId: "Foundation:Date",
            symbolName: "Date"
        });
        foundationModule.setChild(foundationDateType);
        const foundationDataType = registry.createTypeSymbol({
            symbolId: "Foundation:Data",
            symbolName: "Data"
        });
        foundationModule.setChild(foundationDataType);

        // Client module and types
        const clientModule = registry.createModuleSymbol({ symbolId: "Module", symbolName: "Acme" });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Swift" });
        registry.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Foundation" });

        const userType = registry.createTypeSymbol({ symbolId: "Module:User", symbolName: "User" });
        clientModule.setChild(userType);
        const postType = registry.createTypeSymbol({ symbolId: "Module:Post", symbolName: "Post" });
        clientModule.setChild(postType);
        const postDateType = registry.createTypeSymbol({
            symbolId: "Module:Post:Date",
            symbolName: "Date"
        });
        postType.setChild(postDateType);
        const postCommentType = registry.createTypeSymbol({
            symbolId: "Module:Post:Comment",
            symbolName: "Comment"
        });
        postType.setChild(postCommentType);

        expect(
            registry.resolveReference({
                fromSymbolId: "Module:User",
                targetSymbolId: "Foundation:Date"
            })
        ).toBe("Date");

        expect(
            registry.resolveReference({
                fromSymbolId: "Module:Post",
                targetSymbolId: "Module:Post:Date"
            })
        ).toBe("Date");

        expect(
            registry.resolveReference({
                fromSymbolId: "Module:Post",
                targetSymbolId: "Foundation:Date"
            })
        ).toBe("Foundation.Date");
    });
});
