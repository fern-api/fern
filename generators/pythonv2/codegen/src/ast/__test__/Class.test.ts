import { python } from "../..";

describe("class", () => {
    it("basic", async () => {
        const clazz = python.class_({
            name: "Car"
        });
        expect(clazz.toString()).toMatchSnapshot();
    });

    it("variables with annotation and initializer", async () => {
        const clazz = python.class_({
            name: "Car"
        });
        clazz.addVariable(
            python.variable({ name: "color", type: python.annotation({ type: "str" }), initializer: "'red'" })
        );
        expect(clazz.toString()).toMatchSnapshot();
    });
});
