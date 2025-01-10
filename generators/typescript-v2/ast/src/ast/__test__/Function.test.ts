import { ts } from "../..";

describe("Invocation", () => {
    describe("invokeFunction", () => {
        it("Should generate an invokeFunction", () => {
            const actual = ts.invokeFunction({
                function_: ts.reference({ name: "withBaseURL" }),
                arguments_: [ts.TypeLiteral.string("https://api.example.com")]
            });
            expect(actual.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("function", () => {
        it("Should generate a function", () => {
            const actual = ts.function_({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: ts.Types.string(),
                body: ts.codeblock("console.log('foo');\nreturn baseUrl + 'foo';"),
                docs: undefined
            });
            expect(actual.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("function with a body", () => {
        it("Should generate a function with a body", () => {
            const actual = ts.function_({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: ts.Types.string(),
                body: ts.codeblock("console.log('foo');\nreturn baseUrl + 'foo';"),
                docs: undefined
            });
            expect(actual.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("function with a comment", () => {
        it("Should generate a function with a body", () => {
            const actual = ts.function_({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: ts.Types.string(),
                body: ts.codeblock((writer) => {
                    writer.writeLine("console.log('foo')");
                    writer.writeLine("return baseUrl + 'foo';");
                }),
                docs: "This is a comment"
            });
            expect(actual.toStringFormatted({ customConfig: {} })).toMatchSnapshot();
        });
    });
});
