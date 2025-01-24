import { ts } from "../..";

describe("Reference", () => {
    describe("toStringWithDefaultImport", () => {
        it("Should generate a simple reference with a default-exported reference", async () => {
            const reference = ts.reference({
                name: "defaultReference",
                importFrom: {
                    moduleName: "Module",
                    type: "default"
                }
            });
            expect(await reference.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("toStringSameReferenceTwice", () => {
        it("Should generate a simple snippet using duplicate references", async () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "defaultReference",
                        importFrom: {
                            moduleName: "module",
                            type: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "defaultReference",
                        importFrom: {
                            moduleName: "module",
                            type: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "nonDefaultReference",
                        importFrom: {
                            moduleName: "module",
                            type: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "nonDefaultReference",
                        importFrom: {
                            moduleName: "module",
                            type: "named"
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
            expect(await references.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("toStringWithSingleNonDefaultImport", () => {
        it("Should generate a simple reference with a single named reference", async () => {
            const reference = ts.reference({
                name: "Reference",
                importFrom: {
                    type: "named",
                    moduleName: "module"
                }
            });
            expect(await reference.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("toStringWithMultipleNonDefaultImport", () => {
        it("Should generate a simple reference with multiple named references", async () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference1",
                        importFrom: {
                            moduleName: "module",
                            type: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference2",
                        importFrom: {
                            moduleName: "module",
                            type: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference3",
                        importFrom: {
                            moduleName: "module",
                            type: "named"
                        }
                    })
                );
            });
            expect(await references.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("toStringWithDefaultAndNamed", () => {
        it("Should generate a simple reference with multiple default, starred, and named references", async () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA1",
                        importFrom: {
                            moduleName: "moduleA",
                            type: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA2",
                        importFrom: {
                            moduleName: "moduleA",
                            type: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA3",
                        importFrom: {
                            moduleName: "moduleA",
                            type: "named"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceB1",
                        importFrom: {
                            moduleName: "moduleB",
                            type: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceC1",
                        importFrom: {
                            moduleName: "moduleC",
                            type: "named"
                        }
                    })
                );
            });
            expect(await references.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("toStringWithDefaultAndStar", () => {
        it("Should generate a simple reference with multiple default, starred, and star references", async () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA1",
                        importFrom: {
                            moduleName: "moduleA",
                            type: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA2",
                        importFrom: {
                            moduleName: "moduleA",
                            type: "star",
                            starImportAlias: "alias"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA3",
                        importFrom: {
                            moduleName: "moduleA",
                            type: "star",
                            starImportAlias: "alias"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceB1",
                        importFrom: {
                            moduleName: "moduleB",
                            type: "default"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceC1",
                        importFrom: {
                            moduleName: "moduleC",
                            type: "star",
                            starImportAlias: "alias2"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceC2",
                        importFrom: {
                            moduleName: "moduleC",
                            type: "star",
                            starImportAlias: "alias2"
                        }
                    })
                );
            });
            expect(await references.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });
});
