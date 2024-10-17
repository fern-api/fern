import { ts } from "../..";

describe("Interface", () => {
    describe("toString", () => {
        it("should generate a simple interface", () => {
            const interface_ = ts.interface_({
                name: "SimpleInterface",
                properties: []
            });
            expect(interface_.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an exported interface", () => {
            const interface_ = ts.interface_({
                name: "ExportedInterface",
                properties: [],
                export: true
            });
            expect(interface_.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an interface with one property", () => {
            const interface_ = ts.interface_({
                name: "OnePropertyInterface",
                properties: [{ name: "prop1", type: ts.Type.string() }]
            });
            expect(interface_.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an interface with multiple properties", () => {
            const interface_ = ts.interface_({
                name: "MultiPropertyInterface",
                properties: [
                    { name: "prop1", type: ts.Type.string() },
                    { name: "prop2", type: ts.Type.number() },
                    { name: "prop3", type: ts.Type.boolean() }
                ]
            });
            expect(interface_.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an interface with optional properties", () => {
            const interface_ = ts.interface_({
                name: "OptionalPropsInterface",
                properties: [
                    { name: "required", type: ts.Type.string() },
                    { name: "optional", type: ts.Type.number(), questionMark: true }
                ]
            });
            expect(interface_.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an interface with readonly properties", () => {
            const interface_ = ts.interface_({
                name: "ReadonlyPropsInterface",
                properties: [
                    { name: "mutable", type: ts.Type.string() },
                    { name: "immutable", type: ts.Type.number() }
                ]
            });
            expect(interface_.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an interface with complex types", () => {
            const interface_ = ts.interface_({
                name: "ComplexTypesInterface",
                properties: [
                    { name: "array", type: ts.Type.array(ts.Type.string()) },
                    { name: "literal", type: ts.Type.literal("literal-value") }
                ]
            });
            expect(interface_.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an interface extending another interface", () => {
            const extendedInterface = ts.interface_({
                name: "ExtendedInterface",
                properties: [{ name: "extendedProp", type: ts.Type.number() }],
                extends: [
                    ts.Reference.module({
                        module: "Sdk",
                        name: ["BaseSchema"],
                        source: "../../"
                    })
                ]
            });
            expect(extendedInterface.toString()).toMatchSnapshot();
        });
    });
});
