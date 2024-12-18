import { ts } from "../..";

describe("Invocation", () => {
    describe("invokeMethod", () => {
        it("Should generate an invokeMethod", () => {
            const actual = ts.invokeMethod({
                on: ts.reference({
                    name: "AbstractBaseUrlFactoryHandler"
                }),
                method: "withBaseURL",
                arguments_: [ts.TypeLiteral.string("https://api.example.com")]
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("method", () => {
        it("Should generate a method", () => {
            const actual = ts.method({
                reference: ts.reference({
                    name: "AbstractBaseUrlFactoryHandler"
                }),
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: []
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });

    describe("method with a comment", () => {
        it("Should generate a method with a body", () => {
            const actual = ts.method({
                reference: ts.reference({
                    name: "AbstractBaseUrlFactoryHandler"
                }),
                name: "withBaseURL",
                parameters: [ts.parameter({ name: "baseUrl", type: ts.Types.string() })],
                return_: [ts.Types.string()],
                body: ts.codeblock((writer) => {
                    writer.writeLine("console.log('foo')");
                    writer.writeLine("return baseUrl + 'foo';");
                }),
                docs: "This is a comment"
            });
            expect(actual.toStringFormatted()).toMatchSnapshot();
        });
    });
});
