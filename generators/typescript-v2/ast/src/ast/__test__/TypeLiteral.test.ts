import { ts } from "../..";

describe("TypeLiteral", () => {
    describe("emptyArrayToString", () => {
        it("Should generate an empty array", () => {
            const literal = ts.TypeLiteral.array({
                values: []
            });
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("arrayOfStringsToString", () => {
        it("Should generate an array of strings", () => {
            const literal = ts.TypeLiteral.array({
                values: [ts.TypeLiteral.string("Hello, World!"), ts.TypeLiteral.string("Goodbye, World!")]
            });
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    // N.B. If the array is too short prettier is going to print it on a single line
    describe("longArrayOfStringsToString", () => {
        it("Should generate a multiline array of strings", () => {
            const literal = ts.TypeLiteral.array({
                values: [
                    ts.TypeLiteral.string("Hello, World!"),
                    ts.TypeLiteral.string("Goodbye, World!"),
                    ts.TypeLiteral.string("Hello, World!"),
                    ts.TypeLiteral.string("Goodbye, World!"),
                    ts.TypeLiteral.string("Hello, World!"),
                    ts.TypeLiteral.string("Goodbye, World!"),
                    ts.TypeLiteral.string("Hello, World!"),
                    ts.TypeLiteral.string("Goodbye, World!")
                ]
            });
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("trueBooleanToString", () => {
        it("Should generate a true boolean", () => {
            const literal = ts.TypeLiteral.boolean(true);
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("falseBooleanToString", () => {
        it("Should generate a true boolean", () => {
            const literal = ts.TypeLiteral.boolean(false);
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("numberToString", () => {
        it("Should generate a simple number", () => {
            const literal = ts.TypeLiteral.number(7);
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("stringToString", () => {
        it("Should generate a simple string literal", () => {
            const literal = ts.TypeLiteral.string("Hello, World!");
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("stringWithDoubleQuotesToString", () => {
        it("Should generate a simple string literal with escaped double quotes", () => {
            const literal = ts.TypeLiteral.string('"Hello, World!"');
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("manyLinesMultilineStringToString", () => {
        it("Should generate a multiline string with backticks", () => {
            const literal = ts.TypeLiteral.string(`Hello, 
World!`);
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("manyLinesMultilineStringWithBackticksToString", () => {
        it("Should generate a multiline string with escaped backticks", () => {
            const literal = ts.TypeLiteral.string(`\`Hello, 
World!\``);
            expect(literal.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("simpleObjectToString", () => {
        it("Should generate a simple object", () => {
            const actual = ts.codeblock((writer) => {
                writer.write("let myObj = ");
                writer.writeNode(
                    ts.TypeLiteral.object({
                        fields: [
                            {
                                name: "name",
                                value: ts.TypeLiteral.string("John Smith")
                            },
                            {
                                name: "hometown",
                                value: ts.TypeLiteral.string("New York, New York")
                            }
                        ]
                    })
                );
            });
            expect(actual.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });
});
