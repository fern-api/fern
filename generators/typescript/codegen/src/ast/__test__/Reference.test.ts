import { ts } from "../..";

describe("Reference", () => {
    describe("toStringWithDefaultImport", () => {
        it("Should generate a simple reference with a default-exported reference", () => {
            const reference = ts.reference({
                name: "defaultReference",
                module: {
                    moduleName: "Module",
                    defaultExport: true
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
                            defaultExport: true
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "defaultReference",
                        module: {
                            moduleName: "module",
                            defaultExport: true
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "nonDefaultReference",
                        module: {
                            moduleName: "module"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "nonDefaultReference",
                        module: {
                            moduleName: "module"
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
        it("Should generate a simple reference with a single non-default reference", () => {
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
        it("Should generate a simple reference with multiple non-default references", () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference1",
                        module: {
                            moduleName: "module"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference2",
                        module: {
                            moduleName: "module"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Reference3",
                        module: {
                            moduleName: "module"
                        }
                    })
                );
            });
            expect(references.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("toStringWithDefaultAndNondefault", () => {
        it("Should generate a simple reference with multiple default and non-default references", () => {
            const references = ts.codeblock((writer) => {
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA1",
                        module: {
                            moduleName: "moduleA",
                            defaultExport: true
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA2",
                        module: {
                            moduleName: "moduleA"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceA3",
                        module: {
                            moduleName: "moduleA"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceB1",
                        module: {
                            moduleName: "moduleB",
                            defaultExport: true
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "ReferenceC1",
                        module: {
                            moduleName: "moduleC"
                        }
                    })
                );
            });
            expect(references.toStringFormatted()).toMatchSnapshot();
        });
    });
});
