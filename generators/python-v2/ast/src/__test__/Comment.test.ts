import { python } from "..";
import { Writer } from "../core/Writer";

describe("Comment", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    describe("toString", () => {
        it("Writes a basic one-line comment", async () => {
            const comment = python.comment({ docs: "Hello, world!" });
            comment.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("Writes a multi-line comment", async () => {
            const comment = python.comment({ docs: "Hello,\nWorld!" });
            comment.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("Writes an empty comment for an string", async () => {
            const comment = python.comment({ docs: "" });
            comment.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("Writes nothing for an undefined value", async () => {
            const comment = python.comment({});
            comment.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });
});
