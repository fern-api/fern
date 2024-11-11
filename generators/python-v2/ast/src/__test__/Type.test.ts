import { python } from "..";
import { Type } from "../Type";
import { Writer } from "../core/Writer";

describe("Type", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes int type", async () => {
        const intType = Type.int();
        intType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes float type", async () => {
        const floatType = Type.float();
        floatType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes boolean type", async () => {
        const booleanType = Type.bool();
        booleanType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes string type", async () => {
        const stringType = Type.str();
        stringType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes bytes type", async () => {
        const bytesType = Type.bytes();
        bytesType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes list type", async () => {
        const listType = Type.list(Type.int());
        listType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes set type", async () => {
        const setType = Type.set(Type.str());
        setType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes tuple type", async () => {
        const tupleType = Type.tuple([Type.int(), Type.str()]);
        tupleType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes dict type", async () => {
        const dictType = Type.dict(Type.str(), Type.int());
        dictType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes none type", async () => {
        const noneType = Type.none();
        noneType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes uuid type", async () => {
        const uuidType = Type.uuid();
        uuidType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes optional type", async () => {
        const optionalType = Type.optional(Type.str());
        optionalType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes union type", async () => {
        const unionType = Type.union([Type.int(), Type.str()]);
        unionType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes any type", async () => {
        const anyType = Type.any();
        anyType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes reference type", async () => {
        const referenceType = Type.reference(
            python.reference({
                name: "MyClass",
                modulePath: []
            })
        );
        referenceType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes reference type with attribute path", async () => {
        const referenceType = Type.reference(
            python.reference({
                name: "MyClass",
                modulePath: ["module"],
                attribute: ["attr1", "attr2"]
            })
        );
        referenceType.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
