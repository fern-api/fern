import { python } from "..";
import { Writer } from "../core/Writer";

describe("AccessAttribute", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("should handle the basic case", async () => {
        const attribute = python.accessAttribute({
            lhs: python.reference({ name: "MyClass" }),
            rhs: python.reference({ name: "my_attribute" })
        });

        const writer = new Writer();
        attribute.write(writer);

        expect(await writer.toStringFormatted()).toMatchSnapshot();
        expect(attribute.getReferences().length).toBe(2);
    });
});
