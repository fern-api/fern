import { ts } from "../..";

describe("TypeLiteral", () => {
    describe("numberToString", () => {
        it("Should generate a simple number", () => {
            const literal = ts.TypeLiteral.number(7);
            expect(literal.toStringFormatted()).toMatchSnapshot();
        });
    });
});
