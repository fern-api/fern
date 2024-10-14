import { python } from "../..";

describe("class", () => {
    it("basic", async () => {
        const clazz = python.class_({
            name: "Car"
        });
        expect(clazz.toString()).toMatchSnapshot();
    });
});
