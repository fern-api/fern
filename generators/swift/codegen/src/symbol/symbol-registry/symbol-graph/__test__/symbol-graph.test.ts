import { SymbolGraph } from "../symbol-graph";

describe("SymbolGraph", () => {
    function setupGraph() {
        const graph = new SymbolGraph();
        // Swift
        const swiftModule = graph.createModuleSymbol({ symbolId: "Swift", symbolName: "Swift" });
        const swiftStringType = graph.createTypeSymbol({
            symbolId: "Swift.String",
            symbolName: "String",
            shape: { type: "system" }
        });
        graph.nestSymbol({ parentSymbolId: swiftModule.id, childSymbolId: swiftStringType.id });
        const swiftIntType = graph.createTypeSymbol({
            symbolId: "Swift.Int",
            symbolName: "Int",
            shape: { type: "system" }
        });
        graph.nestSymbol({ parentSymbolId: swiftModule.id, childSymbolId: swiftIntType.id });
        const swiftBoolType = graph.createTypeSymbol({
            symbolId: "Swift.Bool",
            symbolName: "Bool",
            shape: { type: "system" }
        });
        graph.nestSymbol({ parentSymbolId: swiftModule.id, childSymbolId: swiftBoolType.id });

        // Foundation
        const foundationModule = graph.createModuleSymbol({
            symbolId: "Foundation",
            symbolName: "Foundation"
        });
        const foundationURLType = graph.createTypeSymbol({
            symbolId: "Foundation.URL",
            symbolName: "URL",
            shape: { type: "system" }
        });
        graph.nestSymbol({ parentSymbolId: foundationModule.id, childSymbolId: foundationURLType.id });
        const foundationDateType = graph.createTypeSymbol({
            symbolId: "Foundation.Date",
            symbolName: "Date",
            shape: { type: "system" }
        });
        graph.nestSymbol({ parentSymbolId: foundationModule.id, childSymbolId: foundationDateType.id });
        const foundationDataType = graph.createTypeSymbol({
            symbolId: "Foundation.Data",
            symbolName: "Data",
            shape: { type: "system" }
        });
        graph.nestSymbol({ parentSymbolId: foundationModule.id, childSymbolId: foundationDataType.id });

        // Client module and types
        const clientModule = graph.createModuleSymbol({ symbolId: "Module", symbolName: "Acme" });
        graph.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Swift" });
        graph.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Foundation" });

        const userType = graph.createTypeSymbol({
            symbolId: "Module.User",
            symbolName: "User",
            shape: { type: "struct" }
        });
        graph.nestSymbol({ parentSymbolId: clientModule.id, childSymbolId: userType.id });
        const postType = graph.createTypeSymbol({
            symbolId: "Module.Post",
            symbolName: "Post",
            shape: { type: "struct" }
        });
        graph.nestSymbol({ parentSymbolId: clientModule.id, childSymbolId: postType.id });
        const postDateType = graph.createTypeSymbol({
            symbolId: "Module.Post.Date",
            symbolName: "Date",
            shape: { type: "struct" }
        });
        graph.nestSymbol({ parentSymbolId: postType.id, childSymbolId: postDateType.id });
        const postCommentType = graph.createTypeSymbol({
            symbolId: "Module.Post.Comment",
            symbolName: "Comment",
            shape: { type: "struct" }
        });
        graph.nestSymbol({ parentSymbolId: postType.id, childSymbolId: postCommentType.id });

        return graph;
    }

    it("resolves Foundation.Date from Module.User to 'Date'", () => {
        const graph = setupGraph();
        expect(
            graph.reference({
                fromSymbolId: "Module.User",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Date");
    });

    it("resolves Module.Post.Date from Module.Post to 'Date'", () => {
        const graph = setupGraph();
        expect(
            graph.reference({
                fromSymbolId: "Module.Post",
                targetSymbolId: "Module.Post.Date"
            })
        ).toBe("Date");
    });

    it("resolves Foundation.Date from Module.Post to 'Foundation.Date' due to shadow", () => {
        const graph = setupGraph();
        expect(
            graph.reference({
                fromSymbolId: "Module.Post",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Foundation.Date");
    });

    it("resolves Foundation.Date from Module.User to 'Foundation.Date' when another import exposes Date", () => {
        const graph = setupGraph();
        const otherModule = graph.createModuleSymbol({ symbolId: "Other", symbolName: "Other" });
        const otherDate = graph.createTypeSymbol({
            symbolId: "Other.Date",
            symbolName: "Date",
            shape: { type: "struct" }
        });
        graph.nestSymbol({ parentSymbolId: otherModule.id, childSymbolId: otherDate.id });
        graph.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Other" });
        expect(
            graph.reference({
                fromSymbolId: "Module.User",
                targetSymbolId: "Foundation.Date"
            })
        ).toBe("Foundation.Date");
    });

    // New tests for resolveReference(from, reference: string)
    it("resolveReference(from, 'Date') resolves to Foundation.Date from Module.User", () => {
        const graph = setupGraph();
        const resolved = graph.resolveReference({ fromSymbolId: "Module.User", reference: "Date" });
        expect(resolved?.id).toBe("Foundation.Date");
    });

    it("resolveReference(from, 'Post.Date') resolves to Module.Post.Date from Module.User", () => {
        const graph = setupGraph();
        const resolved = graph.resolveReference({ fromSymbolId: "Module.User", reference: "Post.Date" });
        expect(resolved?.id).toBe("Module.Post.Date");
    });

    it("resolveReference(from, 'Foundation.Date') resolves to Foundation.Date from Module.User", () => {
        const graph = setupGraph();
        const resolved = graph.resolveReference({ fromSymbolId: "Module.User", reference: "Foundation.Date" });
        expect(resolved?.id).toBe("Foundation.Date");
    });

    it("resolveReference returns null for ambiguous single-segment across imports", () => {
        const graph = setupGraph();
        const otherModule = graph.createModuleSymbol({ symbolId: "Other", symbolName: "Other" });
        const otherDate = graph.createTypeSymbol({
            symbolId: "Other.Date",
            symbolName: "Date",
            shape: { type: "struct" }
        });
        graph.nestSymbol({ parentSymbolId: otherModule.id, childSymbolId: otherDate.id });
        graph.addImportRelation({ clientSymbolId: "Module", importedSymbolId: "Other" });
        const resolved = graph.resolveReference({ fromSymbolId: "Module.User", reference: "Date" });
        expect(resolved).toBeNull();
    });
});
