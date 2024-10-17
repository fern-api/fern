import { ts } from "../..";

describe("TypescriptFile", () => {
    describe("toStringFormatted", () => {
        it("should generate an empty TypeScript file", () => {
            const file = ts.file();
            expect(file.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with one interface", () => {
            const file = ts.file();
            file.addInterface(
                ts.interface_({
                    name: "SimpleInterface",
                    properties: [{ name: "prop", type: ts.Type.string() }]
                })
            );
            expect(file.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with multiple interfaces", () => {
            const file = ts.file();
            file.addInterface(
                ts.interface_({
                    name: "Interface1",
                    properties: [{ name: "prop1", type: ts.Type.string() }]
                })
            );
            file.addInterface(
                ts.interface_({
                    name: "Interface2",
                    properties: [{ name: "prop2", type: ts.Type.number() }]
                })
            );
            expect(file.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with one namespace", () => {
            const file = ts.file();
            const namespace = ts.namespace({ name: "SimpleNamespace" });
            namespace.addInterface(
                ts.interface_({
                    name: "InnerInterface",
                    properties: [{ name: "prop", type: ts.Type.string() }]
                })
            );
            file.addNamespace(namespace);
            expect(file.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with multiple namespaces", () => {
            const file = ts.file();
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
            file.addNamespace(namespace1);
            file.addNamespace(namespace2);
            expect(file.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a TypeScript file with mixed content", () => {
            const file = ts.file();
            file.addInterface(
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
            file.addNamespace(namespace);
            file.addInterface(
                ts.interface_({
                    name: "AnotherTopLevelInterface",
                    properties: [{ name: "anotherProp", type: ts.Type.boolean() }]
                })
            );
            expect(file.toStringFormatted()).toMatchSnapshot();
        });

        it("should maintain the correct order of added elements", () => {
            const file = ts.file();
            file.addInterface(ts.interface_({ name: "Interface1", properties: [] }));
            file.addNamespace(ts.namespace({ name: "Namespace1" }));
            file.addInterface(ts.interface_({ name: "Interface2", properties: [] }));
            file.addNamespace(ts.namespace({ name: "Namespace2" }));
            expect(file.toStringFormatted()).toMatchSnapshot();
        });
    });
});
