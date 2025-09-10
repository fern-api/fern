import { describe, expect, it } from "vitest";

import { swift } from "../../..";

describe("Statement.if", () => {
    describe("write", () => {
        it("should write basic if statement", () => {
            const ifStatement = swift.Statement.if({
                condition: swift.Statement.constantDeclaration({
                    unsafeName: "value",
                    value: swift.Expression.reference("optionalValue"),
                    noTrailingNewline: true
                }),
                body: [swift.Statement.raw("doSomething")]
            });

            expect(ifStatement.toString()).toMatchInlineSnapshot(`
              "if let value = optionalValue {
                  doSomething
              }
              "
            `);
        });

        it("should write if statement with else clause", () => {
            const ifStatement = swift.Statement.if({
                condition: swift.Statement.constantDeclaration({
                    unsafeName: "value",
                    value: swift.Expression.reference("optionalValue"),
                    noTrailingNewline: true
                }),
                body: [swift.Statement.raw("handleValue")],
                else: [swift.Statement.raw("handleDefault")]
            });

            expect(ifStatement.toString()).toMatchInlineSnapshot(`
              "if let value = optionalValue {
                  handleValue
              } else {
                  handleDefault
              }
              "
            `);
        });

        it("should write if statement with single else if clause", () => {
            const ifStatement = swift.Statement.if({
                condition: swift.Statement.constantDeclaration({
                    unsafeName: "x",
                    value: swift.Expression.reference("getX()"),
                    noTrailingNewline: true
                }),
                body: [swift.Statement.expressionStatement(swift.Expression.reference("handleX"))],
                elseIfs: [
                    {
                        condition: swift.Statement.constantDeclaration({
                            unsafeName: "y",
                            value: swift.Expression.reference("getY()"),
                            noTrailingNewline: true
                        }),
                        body: [swift.Statement.raw("handleY")]
                    }
                ]
            });

            expect(ifStatement.toString()).toMatchInlineSnapshot(`
              "if let x = getX() {
                  handleX
              } else if let y = getY() {
                  handleY
              }
              "
            `);
        });

        it("should write if statement with multiple else if clauses and else clause", () => {
            const ifStatement = swift.Statement.if({
                condition: swift.Statement.constantDeclaration({
                    unsafeName: "a",
                    value: swift.Expression.reference("getA()"),
                    noTrailingNewline: true
                }),
                body: [swift.Statement.expressionStatement(swift.Expression.reference("handleA"))],
                elseIfs: [
                    {
                        condition: swift.Statement.constantDeclaration({
                            unsafeName: "b",
                            value: swift.Expression.reference("getB()"),
                            noTrailingNewline: true
                        }),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("handleB"))]
                    },
                    {
                        condition: swift.Statement.constantDeclaration({
                            unsafeName: "c",
                            value: swift.Expression.reference("getC()"),
                            noTrailingNewline: true
                        }),
                        body: [swift.Statement.raw("handleC")]
                    }
                ],
                else: [swift.Statement.raw("handleDefault")]
            });

            expect(ifStatement.toString()).toMatchInlineSnapshot(`
              "if let a = getA() {
                  handleA
              } else if let b = getB() {
                  handleB
              } else if let c = getC() {
                  handleC
              } else {
                  handleDefault
              }
              "
            `);
        });

        it("should write if statement with multiple statements per block", () => {
            const ifStatement = swift.Statement.if({
                condition: swift.Statement.constantDeclaration({
                    unsafeName: "value",
                    value: swift.Expression.reference("getValue()"),
                    noTrailingNewline: true
                }),
                body: [swift.Statement.raw("print(result)")],
                elseIfs: [
                    {
                        condition: swift.Statement.constantDeclaration({
                            unsafeName: "backup",
                            value: swift.Expression.reference("getBackup()"),
                            noTrailingNewline: true
                        }),
                        body: [
                            swift.Statement.variableDeclaration({
                                unsafeName: "temp",
                                value: swift.Expression.reference("backup")
                            })
                        ]
                    }
                ],
                else: [swift.Statement.raw("print(message)"), swift.Statement.raw("return false")]
            });

            expect(ifStatement.toString()).toMatchInlineSnapshot(`
              "if let value = getValue() {
                  print(result)
              } else if let backup = getBackup() {
                  var temp = backup
              } else {
                  print(message)
                  return false
              }
              "
            `);
        });
    });
});
