import { ts } from "../..";

describe("Reference", () => {
    describe("toStringWithDefaultImport", () => {
        it("Should generate a simple reference with a default-exported reference", () => {
            const reference = ts.reference({
                name: "fs",
                module: {
                    moduleName: "fs",
                    defaultExport: true
                }
            });
            expect(reference.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("toStringWithSingleNonDefaultImport", () => {
        it("Should generate a simple reference with a single non-default reference", () => {
            const reference = ts.reference({
                name: "Field",
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
                        name: "Field1",
                        module: {
                            moduleName: "module"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Field2",
                        module: {
                            moduleName: "module"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "Field3",
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
                        name: "FieldA1",
                        module: {
                            moduleName: "moduleA",
                            defaultExport: true
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "FieldA2",
                        module: {
                            moduleName: "moduleA"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "FieldA3",
                        module: {
                            moduleName: "moduleA"
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "FieldB1",
                        module: {
                            moduleName: "moduleB",
                            defaultExport: true
                        }
                    })
                );
                writer.writeNodeStatement(
                    ts.reference({
                        name: "FieldC1",
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
