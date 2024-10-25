import { TypeInstantiation } from "../TypeInstantiation";
import { Writer } from "../core/Writer";

describe("TypeInstantiation", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("int", async () => {
        TypeInstantiation.int(42).write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("float", async () => {
        TypeInstantiation.float(3.14).write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    describe("bool", () => {
        it("true", async () => {
            TypeInstantiation.bool(true).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("false", async () => {
            TypeInstantiation.bool(false).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });

    it("str", async () => {
        TypeInstantiation.str("hello").write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("bytes", async () => {
        TypeInstantiation.bytes("world").write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("list", async () => {
        TypeInstantiation.list([
            TypeInstantiation.int(1),
            TypeInstantiation.str("two"),
            TypeInstantiation.bool(true)
        ]).write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("set", async () => {
        TypeInstantiation.set([
            TypeInstantiation.int(1),
            TypeInstantiation.str("two"),
            TypeInstantiation.bool(true)
        ]).write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("tuple", async () => {
        TypeInstantiation.tuple([
            TypeInstantiation.int(1),
            TypeInstantiation.str("two"),
            TypeInstantiation.bool(true)
        ]).write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("dict", async () => {
        TypeInstantiation.dict([
            { key: TypeInstantiation.str("one"), value: TypeInstantiation.int(1) },
            { key: TypeInstantiation.str("two"), value: TypeInstantiation.bool(true) }
        ]).write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("none", async () => {
        TypeInstantiation.none().write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
