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
        clazz.addField(python.field({ name: "color", type: python.Type.str(), initializer: "'red'" }));
        clazz.addField(
            python.field({
                name: "partNameById",
                type: python.Type.dict(python.Type.int(), python.Type.str()),
                initializer: "{}"
            })
        );
        expect(clazz.toString()).toMatchSnapshot();
    });
});
