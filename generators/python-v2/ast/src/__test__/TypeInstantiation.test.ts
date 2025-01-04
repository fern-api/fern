import { python } from "..";
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

    describe("str", () => {
        it("should render a basic string", async () => {
            TypeInstantiation.str("hello").write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should render a string containing quote", async () => {
            TypeInstantiation.str('She said "hello!"').write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should render a string containing escaped newline characters", async () => {
            TypeInstantiation.str("\n\n####\n\n").write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should render a multiline string", async () => {
            TypeInstantiation.str("\n\n####\n\n", { multiline: true }).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should render a multiline string containing escaped quotes", async () => {
            TypeInstantiation.str('She said "Hi"\nHe said "bye"\nShe said "okay then"', { multiline: true }).write(
                writer
            );
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should render a string containing escaped newline characters and quotes", async () => {
            TypeInstantiation.str('She said "Hi"\nHe said "bye"\nShe said "okay then"').write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should render a multiline string containing an escaped quote", async () => {
            TypeInstantiation.str(
                // prettier-ignore

                "{{ chat_history[-1][\"text\"] }}",
                {
                    multiline: true
                }
            ).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });

    it("bytes", async () => {
        TypeInstantiation.bytes("world").write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    describe("list", () => {
        it("basic", async () => {
            TypeInstantiation.list([
                TypeInstantiation.int(1),
                TypeInstantiation.str("two"),
                TypeInstantiation.bool(true)
            ]).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("set", () => {
        it("basic", async () => {
            TypeInstantiation.set([
                TypeInstantiation.int(1),
                TypeInstantiation.str("two"),
                TypeInstantiation.bool(true)
            ]).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should support trailing comma", async () => {
            TypeInstantiation.set(
                [TypeInstantiation.int(1), TypeInstantiation.str("two"), TypeInstantiation.bool(true)],
                { endWithComma: true }
            ).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("tuple", () => {
        it("basic", async () => {
            TypeInstantiation.tuple([
                TypeInstantiation.int(1),
                TypeInstantiation.str("two"),
                TypeInstantiation.bool(true)
            ]).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should support trailing comma", async () => {
            TypeInstantiation.tuple(
                [TypeInstantiation.int(1), TypeInstantiation.str("two"), TypeInstantiation.bool(true)],
                { endWithComma: true }
            ).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should handle single-element tuple", async () => {
            TypeInstantiation.tuple([TypeInstantiation.int(1)]).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("dict", () => {
        it("should correctly write a dict with primitives", async () => {
            TypeInstantiation.dict([
                { key: TypeInstantiation.str("one"), value: TypeInstantiation.int(1) },
                { key: TypeInstantiation.str("two"), value: TypeInstantiation.bool(true) }
            ]).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });

        it("should correctly write a dict with references", async () => {
            const dict = TypeInstantiation.dict([
                { key: TypeInstantiation.str("one"), value: python.reference({ name: "MyClass" }) },
                { key: TypeInstantiation.str("two"), value: python.TypeInstantiation.uuid("abc") }
            ]);
            dict.write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
            expect(dict.getReferences().length).toBe(2);
        });

        it("should support trailing comma", async () => {
            TypeInstantiation.dict(
                [
                    { key: TypeInstantiation.str("one"), value: TypeInstantiation.int(1) },
                    { key: TypeInstantiation.str("two"), value: TypeInstantiation.bool(true) }
                ],
                { endWithComma: true }
            ).write(writer);
            expect(await writer.toStringFormatted()).toMatchSnapshot();
        });
    });

    it("none", async () => {
        TypeInstantiation.none().write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("uuid", async () => {
        TypeInstantiation.uuid("123e4567-e89b-12d3-a456-426614174000").write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
