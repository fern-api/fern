import { python } from "..";
import { Writer } from "../core/Writer";

describe("class", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("basic", async () => {
        const clazz = python.class_({
            name: "Car"
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("fields with annotation and initializer", async () => {
        const clazz = python.class_({
            name: "Car"
        });
        clazz.add(python.field({ name: "color", type: python.Type.str(), initializer: python.codeBlock("'red'") }));
        clazz.add(
            python.field({
                name: "partNameById",
                type: python.Type.dict(python.Type.int(), python.Type.str()),
                initializer: python.codeBlock("{}")
            })
        );
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("inherits from one parent class", async () => {
        const clazz = python.class_({
            name: "ElectricCar",
            extends_: [python.reference({ name: "Car" })]
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("inherits from two parent classes", async () => {
        const clazz = python.class_({
            name: "HybridCar",
            extends_: [python.reference({ name: "ElectricCar" }), python.reference({ name: "GasCar" })]
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("inherits from a parent class imported from another module", async () => {
        const clazz = python.class_({
            name: "SportsCar",
            extends_: [
                python.reference({
                    name: "Vehicle",
                    modulePath: ["vehicles", "base"]
                })
            ]
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("class with a decorator", async () => {
        const clazz = python.class_({
            name: "MyDataClass",
            decorators: [
                python.decorator({
                    callable: python.reference({ name: "dataclass", modulePath: ["dataclasses"] })
                })
            ]
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
        expect(clazz.getReferences().length).toBe(1);
    });

    it("should generate a class with local classes", async () => {
        const clazz = python.class_({
            name: "OuterClass"
        });

        const parentClassRef = python.reference({
            name: "ParentClass",
            modulePath: ["some_module"]
        });

        const innerClassDef = python.class_({
            name: "InnerClass",
            extends_: [parentClassRef]
        });
        const innerMethod = python.method({
            name: "inner_method",
            parameters: [python.parameter({ name: "self", type: python.Type.str() })]
        });
        innerMethod.addStatement(python.codeBlock('return "Inner method called"'));
        innerClassDef.add(innerMethod);

        clazz.add(innerClassDef);

        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("class with generic parent reference", async () => {
        const clazz = python.class_({
            name: "MyClass",
            extends_: [
                python.reference({
                    name: "MyParentClass",
                    modulePath: ["base"],
                    genericTypes: [
                        python.reference({
                            name: "MyParentType",
                            modulePath: ["models"]
                        })
                    ]
                })
            ]
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();

        expect(clazz.getReferences().length).toBe(2);
    });

    it("class with various forms of multi-line strings", async () => {
        const clazz = python.class_({
            name: "MyClass"
        });
        clazz.add(
            python.field({
                name: "has_newline_chars__basic",
                type: python.Type.str(),
                initializer: python.TypeInstantiation.str("Hello,\nWorld!", { multiline: true })
            })
        );
        clazz.add(
            python.field({
                name: "has_no_newline_chars__basic",
                type: python.Type.str(),
                initializer: python.TypeInstantiation.str("Hello, World!", { multiline: true })
            })
        );
        clazz.add(
            python.field({
                name: "has_newline_chars__start_on_new_line",
                type: python.Type.str(),
                initializer: python.TypeInstantiation.str("Hello,\nWorld!", { multiline: true, startOnNewLine: true })
            })
        );
        clazz.add(
            python.field({
                name: "has_newline_chars__end_with_new_line",
                type: python.Type.str(),
                initializer: python.TypeInstantiation.str("Hello,\nWorld!", { multiline: true, endWithNewLine: true })
            })
        );
        clazz.add(
            python.field({
                name: "has_newline_chars__start_and_end_with_new_line",
                type: python.Type.str(),
                initializer: python.TypeInstantiation.str("Hello,\nWorld!", {
                    multiline: true,
                    startOnNewLine: true,
                    endWithNewLine: true
                })
            })
        );

        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Renders docs correctly", async () => {
        const clazz = python.class_({
            name: "MyClass",
            docs: "This is a class"
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("Renders docs with multi-line strings correctly", async () => {
        const clazz = python.class_({
            name: "MyClass",
            docs: "This is a class.\nI'm on a new line.\nSo am I."
        });
        clazz.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
