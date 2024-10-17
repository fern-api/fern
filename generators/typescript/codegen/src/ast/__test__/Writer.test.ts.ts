import { ts, Writer } from "../..";

describe("TypescriptFile", () => {
    describe("toStringFormatted", () => {
        it("should generate an empty TypeScript file", () => {
            const writer = new Writer();
            expect(writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with one interface", () => {
            const writer = new Writer();
            writer.addInterface(
                ts.interface_({
                    name: "SimpleInterface",
                    properties: [{ name: "prop", type: ts.Type.string() }]
                })
            );
            expect(writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with multiple interfaces", () => {
            const writer = new Writer();
            writer.addInterface(
                ts.interface_({
                    name: "Interface1",
                    properties: [{ name: "prop1", type: ts.Type.string() }]
                })
            );
            writer.addInterface(
                ts.interface_({
                    name: "Interface2",
                    properties: [{ name: "prop2", type: ts.Type.number() }]
                })
            );
            expect(writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with one namespace", () => {
            const writer = new Writer();
            const namespace = ts.namespace({ name: "SimpleNamespace" });
            namespace.addInterface(
                ts.interface_({
                    name: "InnerInterface",
                    properties: [{ name: "prop", type: ts.Type.string() }]
                })
            );
            writer.addNamespace(namespace);
            expect(writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with multiple namespaces", () => {
            const writer = new Writer();
            const namespace1 = ts.namespace({ name: "Namespace1" });
            namespace1.addInterface(
                ts.interface_({
                    name: "Interface1",
                    properties: [{ name: "prop1", type: ts.Type.string() }]
                })
            );
            const namespace2 = ts.namespace({ name: "Namespace2" });
            namespace2.addInterface(
                ts.interface_({
                    name: "Interface2",
                    properties: [{ name: "prop2", type: ts.Type.number() }]
                })
            );
            writer.addNamespace(namespace1);
            writer.addNamespace(namespace2);
            expect(writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with mixed content", () => {
            const writer = new Writer();
            writer.addInterface(
                ts.interface_({
                    name: "TopLevelInterface",
                    properties: [{ name: "topProp", type: ts.Type.string() }]
                })
            );
            const namespace = ts.namespace({ name: "MixedNamespace" });
            namespace.addInterface(
                ts.interface_({
                    name: "NestedInterface",
                    properties: [{ name: "nestedProp", type: ts.Type.number() }]
                })
            );
            writer.addNamespace(namespace);
            writer.addInterface(
                ts.interface_({
                    name: "AnotherTopLevelInterface",
                    properties: [{ name: "anotherProp", type: ts.Type.boolean() }]
                })
            );
            expect(writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should maintain the correct order of added elements", () => {
            const writer = new Writer();
            writer.addInterface(ts.interface_({ name: "Interface1", properties: [] }));
            writer.addNamespace(ts.namespace({ name: "Namespace1" }));
            writer.addInterface(ts.interface_({ name: "Interface2", properties: [] }));
            writer.addNamespace(ts.namespace({ name: "Namespace2" }));
            expect(writer.toStringFormatted()).toMatchSnapshot();
        });
    });
});
