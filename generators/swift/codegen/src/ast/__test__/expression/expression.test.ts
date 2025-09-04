import { describe, expect, it } from "vitest";

import { swift } from "../../..";

describe("Expression", () => {
    describe("functionCall multiline vs single-line", () => {
        it("should write single-line function call with multiple arguments", () => {
            const functionCall = swift.Expression.functionCall({
                unsafeName: "configure",
                arguments_: [
                    swift.functionArgument({
                        label: "host",
                        value: swift.Expression.stringLiteral("localhost")
                    }),
                    swift.functionArgument({
                        label: "port",
                        value: swift.Expression.rawValue("8080")
                    }),
                    swift.functionArgument({
                        label: "timeout",
                        value: swift.Expression.rawValue("30.0")
                    })
                ]
            });

            expect(functionCall.toString()).toMatchInlineSnapshot(
                '"configure(host: "localhost", port: 8080, timeout: 30.0)"'
            );
        });

        it("should write multiline function call with a single argument", () => {
            const functionCall = swift.Expression.functionCall({
                unsafeName: "configure",
                arguments_: [
                    swift.functionArgument({
                        label: "host",
                        value: swift.Expression.stringLiteral("localhost")
                    })
                ],
                multiline: true
            });

            expect(functionCall.toString()).toMatchInlineSnapshot(`
              "configure(
                  host: "localhost"
              )"
            `);
        });

        it("should write multiline function call with multiple arguments", () => {
            const functionCall = swift.Expression.functionCall({
                unsafeName: "configure",
                arguments_: [
                    swift.functionArgument({
                        label: "host",
                        value: swift.Expression.stringLiteral("localhost")
                    }),
                    swift.functionArgument({
                        label: "port",
                        value: swift.Expression.rawValue("8080")
                    }),
                    swift.functionArgument({
                        label: "timeout",
                        value: swift.Expression.rawValue("30.0")
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

    describe("dictionaryLiteral", () => {
        it("should correctly write dictionary literal with no entries", () => {
            const dictionaryLiteral = swift.Expression.dictionaryLiteral({
                entries: []
            });
            expect(dictionaryLiteral.toString()).toMatchInlineSnapshot('"[:]"');
        });

        it("should correctly write dictionary literal with no entries (multiline)", () => {
            const dictionaryLiteral = swift.Expression.dictionaryLiteral({
                entries: [],
                multiline: true
            });
            expect(dictionaryLiteral.toString()).toMatchInlineSnapshot('"[:]"');
        });

        it("should correctly write dictionary literal with a single entry", () => {
            const dictionaryLiteral = swift.Expression.dictionaryLiteral({
                entries: [[swift.Expression.stringLiteral("host"), swift.Expression.stringLiteral("localhost")]]
            });
            expect(dictionaryLiteral.toString()).toMatchInlineSnapshot('"["host": "localhost"]"');
        });

        it("should correctly write dictionary literal with a single entry (multiline)", () => {
            const dictionaryLiteral = swift.Expression.dictionaryLiteral({
                entries: [[swift.Expression.stringLiteral("host"), swift.Expression.stringLiteral("localhost")]],
                multiline: true
            });
            expect(dictionaryLiteral.toString()).toMatchInlineSnapshot(`
              "[
                  "host": "localhost"
              ]"
            `);
        });

        it("should correctly write dictionary literal with multiple entries", () => {
            const dictionaryLiteral = swift.Expression.dictionaryLiteral({
                entries: [
                    [swift.Expression.stringLiteral("host"), swift.Expression.stringLiteral("localhost")],
                    [swift.Expression.stringLiteral("port"), swift.Expression.stringLiteral("8080")]
                ]
            });

            expect(dictionaryLiteral.toString()).toMatchInlineSnapshot('"["host": "localhost", "port": "8080"]"');
        });

        it("should correctly write dictionary literal with multiple entries (multiline)", () => {
            const dictionaryLiteral = swift.Expression.dictionaryLiteral({
                entries: [
                    [swift.Expression.stringLiteral("host"), swift.Expression.stringLiteral("localhost")],
                    [swift.Expression.stringLiteral("port"), swift.Expression.stringLiteral("8080")]
                ],
                multiline: true
            });

            expect(dictionaryLiteral.toString()).toMatchInlineSnapshot(`
              "[
                  "host": "localhost", 
                  "port": "8080"
              ]"
            `);
        });
    });
});
