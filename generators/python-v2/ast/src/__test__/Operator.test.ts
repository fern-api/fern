import { python } from "..";
import { OperatorType } from "../OperatorType";
import { Writer } from "../core/Writer";

describe("Operator", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes or operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.Or,
            lhs: python.TypeInstantiation.bool(true),
            rhs: python.TypeInstantiation.bool(false)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes and operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.And,
            lhs: python.TypeInstantiation.bool(true),
            rhs: python.TypeInstantiation.bool(false)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes addition operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.Add,
            lhs: python.TypeInstantiation.int(5),
            rhs: python.TypeInstantiation.int(3)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes subtraction operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.Subtract,
            lhs: python.TypeInstantiation.int(10),
            rhs: python.TypeInstantiation.int(4)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes multiplication operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.Multiply,
            lhs: python.TypeInstantiation.int(6),
            rhs: python.TypeInstantiation.int(7)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes division operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.Divide,
            lhs: python.TypeInstantiation.int(15),
            rhs: python.TypeInstantiation.int(3)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes modulo operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.Modulo,
            lhs: python.TypeInstantiation.int(17),
            rhs: python.TypeInstantiation.int(5)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes bitwise left shift operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.LeftShift,
            lhs: python.TypeInstantiation.int(1),
            rhs: python.TypeInstantiation.int(2)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes bitwise right shift operators correctly", async () => {
        const operator = python.operator({
            operator: OperatorType.RightShift,
            lhs: python.TypeInstantiation.int(8),
            rhs: python.TypeInstantiation.int(1)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
