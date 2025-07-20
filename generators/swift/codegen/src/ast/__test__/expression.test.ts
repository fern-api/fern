import { describe, expect, it } from "vitest";

import { Expression } from "../Expression";
import { FunctionArgument } from "../FunctionArgument";

describe("Expression", () => {
    describe("functionCall multiline vs single-line", () => {
        it("should write single-line function call with multiple arguments", () => {
            const functionCall = Expression.functionCall({
                unsafeName: "configure",
                arguments_: [
                    new FunctionArgument({
                        label: "host",
                        value: Expression.rawStringValue("localhost")
                    }),
                    new FunctionArgument({
                        label: "port",
                        value: Expression.rawValue("8080")
                    }),
                    new FunctionArgument({
                        label: "timeout",
                        value: Expression.rawValue("30.0")
                    })
                ]
            });

            expect(functionCall.toString()).toMatchInlineSnapshot(
                `"configure(host: \"localhost\", port: 8080, timeout: 30.0)"`
            );
        });

        it("should write multiline function call with a single argument", () => {
            const functionCall = Expression.functionCall({
                unsafeName: "configure",
                arguments_: [
                    new FunctionArgument({
                        label: "host",
                        value: Expression.rawStringValue("localhost")
                    })
                ],
                multiline: true
            });

            expect(functionCall.toString()).toMatchInlineSnapshot(`
              "configure(
                  host: \"localhost\"
              )"
            `);
        });

        it("should write multiline function call with multiple arguments", () => {
            const functionCall = Expression.functionCall({
                unsafeName: "configure",
                arguments_: [
                    new FunctionArgument({
                        label: "host",
                        value: Expression.rawStringValue("localhost")
                    }),
                    new FunctionArgument({
                        label: "port",
                        value: Expression.rawValue("8080")
                    }),
                    new FunctionArgument({
                        label: "timeout",
                        value: Expression.rawValue("30.0")
                    })
                ],
                multiline: true
            });

            expect(functionCall.toString()).toMatchInlineSnapshot(`
              "configure(
                  host: "localhost", 
                  port: 8080, 
                  timeout: 30.0
              )"
            `);
        });
    });
});
