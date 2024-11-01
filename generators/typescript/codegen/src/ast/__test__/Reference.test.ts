import { ts } from "../..";

describe("Reference", () => {
    describe("toStringWithDefaultImport", () => {
        it("Should generate a simple reference with a default-exported reference", () => {
            const reference = ts.reference({
                name: "defaultReference",
                module: {
                    moduleName: "Module",
                    importType: "default"
                }
            });
            expect(reference.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("toStringSameReferenceTwice", () => {
        it("Should generate a simple snippet using duplicate references", () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "defaultReference",
                        module: {
                            moduleName: "module",
                            importType: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "defaultReference",
                        module: {
                            moduleName: "module",
                            importType: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "nonDefaultReference",
                        module: {
                            moduleName: "module",
                            importType: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "nonDefaultReference",
                        module: {
                            moduleName: "module",
                            importType: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "localReference"
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "localReference"
                    })
                );
            });
            expect(references.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("toStringWithSingleNonDefaultImport", () => {
        it("Should generate a simple reference with a single named reference", () => {
            const reference = ts.reference({
                name: "Reference",
                module: {
                    moduleName: "module"
                }
            });
            expect(reference.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("toStringWithMultipleNonDefaultImport", () => {
        it("Should generate a simple reference with multiple named references", () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference1",
                        module: {
                            moduleName: "module",
                            importType: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference2",
                        module: {
                            moduleName: "module",
                            importType: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference3",
                        module: {
                            moduleName: "module",
                            importType: "named"
                        }
                    })
                );
            });
            expect(references.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("toStringWithDefaultAndNamed", () => {
        it("Should generate a simple reference with multiple default, starred, and named references", () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA1",
                        module: {
                            moduleName: "moduleA",
                            importType: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA2",
                        module: {
                            moduleName: "moduleA",
                            importType: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA3",
                        module: {
                            moduleName: "moduleA",
                            importType: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceB1",
                        module: {
                            moduleName: "moduleB",
                            importType: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceC1",
                        module: {
                            moduleName: "moduleC",
                            importType: "named"
                        }
                    })
                );
            });
            expect(references.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("toStringWithDefaultAndStar", () => {
        it("Should generate a simple reference with multiple default, starred, and star references", () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA1",
                        module: {
                            moduleName: "moduleA",
                            importType: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA2",
                        module: {
                            moduleName: "moduleA",
                            importType: "star",
                            starImportAlias: "alias"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA3",
                        module: {
                            moduleName: "moduleA",
                            importType: "star",
                            starImportAlias: "alias"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceB1",
                        module: {
                            moduleName: "moduleB",
                            importType: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceC1",
                        module: {
                            moduleName: "moduleC",
                            importType: "star",
                            starImportAlias: "alias"
                        }
                    })
                );
            });
            expect(references.toStringFormatted()).toMatchSnapshot();
        });
    });
});
