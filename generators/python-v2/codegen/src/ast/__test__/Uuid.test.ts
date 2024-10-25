import { python } from "../..";
import { Writer } from "../core/Writer";

describe("UUID", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes a UUID instance with the expected value", async () => {
        const field = python.uuid({ value: "e5ff9360-a29c-437b-a9c1-05fc52df2834" });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
