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
});
