import { python } from "../..";
import { ClassReference } from "../ClassReference";
import { Type } from "../Type";
import { Writer } from "../core/Writer";

describe("Type", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes int type", () => {
        const intType = Type.int();
        intType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes float type", () => {
        const floatType = Type.float();
        floatType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes boolean type", () => {
        const booleanType = Type.bool();
        booleanType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes string type", () => {
        const stringType = Type.str();
        stringType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes bytes type", () => {
        const bytesType = Type.bytes();
        bytesType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes list type", () => {
        const listType = Type.list(Type.int());
        listType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes set type", () => {
        const setType = Type.set(Type.str());
        setType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes tuple type", () => {
        const tupleType = Type.tuple([Type.int(), Type.str()]);
        tupleType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes dict type", () => {
        const dictType = Type.dict(Type.str(), Type.int());
        dictType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes none type", () => {
        const noneType = Type.none();
        noneType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes optional type", () => {
        const optionalType = Type.optional(Type.str());
        optionalType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes union type", () => {
        const unionType = Type.union([Type.int(), Type.str()]);
        unionType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes any type", () => {
        const anyType = Type.any();
        anyType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });

    it("writes reference type", () => {
        const referenceType = Type.reference(
            python.classReference({
                name: "MyClass",
                modulePath: []
            })
        );
        referenceType.write(writer);
        expect(writer.toString()).toMatchSnapshot();
    });
});
