import { describe, expect, it } from "vitest";

import { swift } from "../../..";

describe("Statement.switch", () => {
    describe("write", () => {
        it("should write basic switch with string cases", () => {
            const switchStatement = swift.Statement.switch({
                target: swift.Expression.reference("status"),
                cases: [
                    {
                        pattern: swift.Expression.rawStringValue("active"),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("handleActive"))]
                    },
                    {
                        pattern: swift.Expression.rawStringValue("inactive"),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("handleInactive"))]
                    }
                ]
            });

            expect(switchStatement.toString()).toMatchInlineSnapshot(`
              "switch status {
              case "active":
                  handleActive
              case "inactive":
                  handleInactive
              }
              "
            `);
        });

        it("should write switch with default case", () => {
            const switchStatement = swift.Statement.switch({
                target: swift.Expression.reference("value"),
                cases: [
                    {
                        pattern: swift.Expression.rawValue("1"),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("handleOne"))]
                    }
                ],
                defaultCase: [swift.Statement.expressionStatement(swift.Expression.reference("handleDefault"))]
            });

            expect(switchStatement.toString()).toMatchInlineSnapshot(`
              "switch value {
              case 1:
                  handleOne
              default:
                  handleDefault
              }
              "
            `);
        });

        it("should write switch with enum cases", () => {
            const switchStatement = swift.Statement.switch({
                target: swift.Expression.reference("direction"),
                cases: [
                    {
                        pattern: swift.Expression.enumCaseShorthand("north"),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("moveNorth"))]
                    },
                    {
                        pattern: swift.Expression.enumCaseShorthand("south"),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("moveSouth"))]
                    }
                ]
            });

            expect(switchStatement.toString()).toMatchInlineSnapshot(`
              "switch direction {
              case .north:
                  moveNorth
              case .south:
                  moveSouth
              }
              "
            `);
        });

        it("should write switch with multiple statements per case", () => {
            const switchStatement = swift.Statement.switch({
                target: swift.Expression.reference("operation"),
                cases: [
                    {
                        pattern: swift.Expression.rawStringValue("add"),
                        body: [
                            swift.Statement.constantDeclaration({
                                unsafeName: "result",
                                value: swift.Expression.rawValue("a + b")
                            }),
                            swift.Statement.expressionStatement(swift.Expression.rawValue("print(result)"))
                        ]
                    }
                ],
                defaultCase: [swift.Statement.expressionStatement(swift.Expression.rawValue('print("Unknown")'))]
            });

            expect(switchStatement.toString()).toMatchInlineSnapshot(`
              "switch operation {
              case "add":
                  let result = a + b
                  print(result)
              default:
                  print("Unknown")
              }
              "
            `);
        });
    });
});
