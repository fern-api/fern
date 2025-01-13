import { ts } from "../..";

describe("Invocation", () => {
    describe("invokeFunction", () => {
        it("Should generate an invokeFunction", async () => {
            const actual = ts.invokeFunction({
                function_: ts.reference({ name: "withBaseURL" }),
                arguments_: [ts.TypeLiteral.string("https://api.example.com")]
            });
            expect(await actual.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("function", () => {
        it("Should generate a function", async () => {
            const actual = ts.function_({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: ts.Types.string(),
                body: ts.codeblock("console.log('foo');\nreturn baseUrl + 'foo';"),
                docs: undefined
            });
            expect(await actual.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("function with a body", () => {
        it("Should generate a function with a body", async () => {
            const actual = ts.function_({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: ts.Types.string(),
                body: ts.codeblock("console.log('foo');\nreturn baseUrl + 'foo';"),
                docs: undefined
            });
            expect(await actual.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });

    describe("function with a comment", () => {
        it("Should generate a function with a body", async () => {
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
            expect(await actual.toStringAsync({ customConfig: {} })).toMatchSnapshot();
        });
    });
});
