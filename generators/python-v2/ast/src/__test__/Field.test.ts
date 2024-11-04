import { python } from "..";
import { Writer } from "../core/Writer";

describe("Field", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes a field with a name and type", async () => {
        const field = python.field({
            name: "my_field",
            type: python.Type.str()
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes a field with a name, type, and value", async () => {
        const field = python.field({
            name: "my_int",
            type: python.Type.int(),
            initializer: python.codeBlock("42")
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes a field with a name and value but no type", async () => {
        const field = python.field({
            name: "my_field",
            initializer: python.codeBlock("'default_value'")
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes a field with a complex type", async () => {
        const field = python.field({
            name: "my_list",
            type: python.Type.list(python.Type.int()),
            initializer: python.codeBlock("[]")
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes a field with an optional type", async () => {
        const field = python.field({
            name: "maybe_string",
            type: python.Type.optional(python.Type.str())
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes a field with a union type", async () => {
        const field = python.field({
            name: "id",
            type: python.Type.union([python.Type.int(), python.Type.str()])
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes a field with a dictionary type", async () => {
        const field = python.field({
            name: "config",
            type: python.Type.dict(python.Type.str(), python.Type.any())
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes a field with a tuple type", async () => {
        const field = python.field({
            name: "coordinates",
            type: python.Type.tuple([python.Type.float(), python.Type.float()])
        });
        field.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
