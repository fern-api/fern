import { python } from "../..";
import { Writer } from "../core/Writer";

describe("Field", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes a field with a name and type", () => {
        const field = python.field({
            name: "my_field",
            type: python.Type.str()
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes a field with a name, type, and value", () => {
        const field = python.field({
            name: "my_int",
            type: python.Type.int(),
            initializer: "42"
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes a field with a name and value but no type", () => {
        const field = python.field({
            name: "my_field",
            initializer: "'default_value'"
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes a field with a complex type", () => {
        const field = python.field({
            name: "my_list",
            type: python.Type.list(python.Type.int()),
            initializer: "[]"
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes a field with an optional type", () => {
        const field = python.field({
            name: "maybe_string",
            type: python.Type.optional(python.Type.str())
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes a field with a union type", () => {
        const field = python.field({
            name: "id",
            type: python.Type.union([python.Type.int(), python.Type.str()])
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes a field with a dictionary type", () => {
        const field = python.field({
            name: "config",
            type: python.Type.dict(python.Type.str(), python.Type.any())
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes a field with a tuple type", () => {
        const field = python.field({
            name: "coordinates",
            type: python.Type.tuple([python.Type.float(), python.Type.float()])
        });
        field.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });
});
