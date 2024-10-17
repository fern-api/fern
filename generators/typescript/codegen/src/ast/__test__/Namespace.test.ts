import { ts } from "../..";

declare namespace SimpleNamespace {}

describe("Namespace", () => {
    describe("toString", () => {
        it("should generate a simple namespace", () => {
            const namespace = ts.namespace({
                name: "SimpleNamespace"
            });
            expect(namespace.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate an exported namespace", () => {
            const namespace = ts.namespace({
                name: "ExportedNamespace",
                export: true
            });
            expect(namespace.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a namespace with one interface", () => {
            const namespace = ts.namespace({
                name: "NamespaceWithInterface"
            });
            namespace.addInterface(
                ts.interface_({
                    name: "InnerInterface",
                    properties: [{ name: "prop", type: ts.Type.string() }]
                })
            );
            expect(namespace.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a namespace with multiple interfaces", () => {
            const namespace = ts.namespace({
                name: "MultiInterfaceNamespace"
            });
            namespace.addInterface(
                ts.interface_({
                    name: "Interface1",
                    properties: [{ name: "prop1", type: ts.Type.string() }]
                })
            );
            namespace.addInterface(
                ts.interface_({
                    name: "Interface2",
                    properties: [{ name: "prop2", type: ts.Type.number() }]
                })
            );
            expect(namespace.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a namespace with a nested namespace", () => {
            const outerNamespace = ts.namespace({
                name: "OuterNamespace"
            });
            const innerNamespace = ts.namespace({
                name: "InnerNamespace"
            });
            innerNamespace.addInterface(
                ts.interface_({
                    name: "InnerInterface",
                    properties: [{ name: "prop", type: ts.Type.string() }]
                })
            );
            outerNamespace.addNamespace(innerNamespace);
            expect(outerNamespace.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a namespace with mixed content", () => {
            const namespace = ts.namespace({
                name: "MixedContentNamespace"
            });
            namespace.addInterface(
                ts.interface_({
                    name: "Interface1",
                    properties: [{ name: "prop1", type: ts.Type.string() }]
                })
            );
            const innerNamespace = ts.namespace({
                name: "InnerNamespace"
            });
            innerNamespace.addInterface(
                ts.interface_({
                    name: "Interface2",
                    properties: [{ name: "prop2", type: ts.Type.number() }]
                })
            );
            namespace.addNamespace(innerNamespace);
            expect(namespace.toStringFormatted()).toMatchSnapshot();
        });

        it("should generate a namespace with complex nested structure", () => {
            const rootNamespace = ts.namespace({
                name: "RootNamespace",
                export: true
            });
            const subNamespace1 = ts.namespace({
                name: "SubNamespace1"
            });
            const subNamespace2 = ts.namespace({
                name: "SubNamespace2"
            });

            rootNamespace.addInterface(
                ts.interface_({
                    name: "RootInterface",
                    properties: [{ name: "rootProp", type: ts.Type.string() }]
                })
            );

            subNamespace1.addInterface(
                ts.interface_({
                    name: "Sub1Interface",
                    properties: [{ name: "sub1Prop", type: ts.Type.number() }]
                })
            );

            subNamespace2.addInterface(
                ts.interface_({
                    name: "Sub2Interface",
                    properties: [{ name: "sub2Prop", type: ts.Type.boolean() }]
                })
            );

            rootNamespace.addNamespace(subNamespace1);
            rootNamespace.addNamespace(subNamespace2);

            expect(rootNamespace.toStringFormatted()).toMatchSnapshot();
        });
    });
});
