import { python } from "../..";
import { Writer } from "../core/Writer";

describe("Operator", () => {
    let writer: Writer;

    beforeEach(() => {
        writer = new Writer();
    });

    it("writes or operators correctly", async () => {
        const operator = python.operator({
            operator: "or",
            lhs: python.TypeInstantiation.bool(true),
            rhs: python.TypeInstantiation.bool(false)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes and operators correctly", async () => {
        const operator = python.operator({
            operator: "and",
            lhs: python.TypeInstantiation.bool(true),
            rhs: python.TypeInstantiation.bool(false)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes bitwise left shift operators correctly", async () => {
        const operator = python.operator({
            operator: "bitwiseLeftShift",
            lhs: python.TypeInstantiation.int(1),
            rhs: python.TypeInstantiation.int(2)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });

    it("writes bitwise right shift operators correctly", async () => {
        const operator = python.operator({
            operator: "bitwiseRightShift",
            lhs: python.TypeInstantiation.int(8),
            rhs: python.TypeInstantiation.int(1)
        });
        operator.write(writer);
        expect(await writer.toStringFormatted()).toMatchSnapshot();
    });
});
