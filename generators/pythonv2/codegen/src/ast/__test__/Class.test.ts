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
        clazz.addField(python.field({ name: "color", type: python.annotation({ type: "str" }), initializer: "'red'" }));
        expect(clazz.toString()).toMatchSnapshot();
    });
});
