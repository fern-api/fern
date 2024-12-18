import { ts } from "../..";

describe("Invocation", () => {
    describe("invokeFunction", () => {
        it("Should generate an invokeFunction", () => {
            const actual = ts.invokeFunction({
                func: ts.reference({ name: "withBaseURL" }),
                arguments_: [ts.TypeLiteral.string("https://api.example.com")]
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("function", () => {
        it("Should generate a function", () => {
            const actual = ts.func({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: [],
                body: undefined,
                docs: undefined
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("function with return type", () => {
        it("Should generate a function with a return type", () => {
            const actual = ts.func({
                name: "withBaseURL",
                parameters: [
                    ts.parameter({ name: "baseUrl", type: ts.Types.string() }),
                    ts.parameter({ name: "foo", type: ts.Types.string() })
                ],
                return_: [ts.Types.string()],
                body: undefined,
                docs: undefined
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("function with a body", () => {
        it("Should generate a function with a body", () => {
            const actual = ts.func({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: [ts.Types.string()],
                body: ts.codeblock("console.log('foo');\nreturn baseUrl + 'foo';"),
                docs: undefined
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("function with a comment", () => {
        it("Should generate a function with a body", () => {
            const actual = ts.func({
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: [ts.Types.string()],
                body: ts.codeblock("console.log('foo');\nreturn baseUrl + 'foo';"),
                docs: "This is a comment"
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });
});
