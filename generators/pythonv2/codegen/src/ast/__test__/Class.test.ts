import { python } from "../..";

describe("class", () => {
    it("basic", async () => {
        const clazz = python.class_({
            name: "Car"
        });
        expect(clazz.toString()).toMatchSnapshot();
    });

    it("fields with annotation and initializer", async () => {
        const clazz = python.class_({
            name: "Car"
        });
        clazz.addField(
            python.field({ name: "color", type: python.Type.str(), initializer: python.codeBlock("'red'") })
        );
        clazz.addField(
            python.field({
                name: "partNameById",
                type: python.Type.dict(python.Type.int(), python.Type.str()),
                initializer: python.codeBlock("{}")
            })
        );
        expect(clazz.toString()).toMatchSnapshot();
    });

    it("inherits from one parent class", async () => {
        const clazz = python.class_({
            name: "ElectricCar",
            extends_: [python.reference({ name: "Car" })]
        });
        expect(clazz.toString()).toMatchSnapshot();
    });

    it("inherits from two parent classes", async () => {
        const clazz = python.class_({
            name: "HybridCar",
            extends_: [python.reference({ name: "ElectricCar" }), python.reference({ name: "GasCar" })]
        });
        expect(clazz.toString()).toMatchSnapshot();
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
        expect(clazz.toString()).toMatchSnapshot();
    });

    it("class with a decorator", () => {
        const clazz = python.class_({
            name: "MyDataClass",
            decorators: [
                python.decorator({
                    reference: python.reference({ name: "dataclass", modulePath: ["dataclasses"] })
                })
            ]
        });
        expect(clazz.toString()).toMatchSnapshot();
    });
});
