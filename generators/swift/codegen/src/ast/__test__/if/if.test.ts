import { describe, expect, it } from "vitest";

import { swift } from "../../..";

describe("Statement.if", () => {
    describe("write", () => {
        it("should write basic if statement", () => {
            const ifStatement = swift.Statement.if({
                condition: swift.Statement.constantDeclaration("value", swift.Expression.reference("optionalValue")),
                body: [swift.Statement.expressionStatement(swift.Expression.reference("doSomething"))]
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
                condition: swift.Statement.constantDeclaration("value", swift.Expression.reference("optionalValue")),
                body: [swift.Statement.expressionStatement(swift.Expression.reference("handleValue"))],
                elseBody: [swift.Statement.expressionStatement(swift.Expression.reference("handleDefault"))]
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
                condition: swift.Statement.constantDeclaration("x", swift.Expression.reference("getX()")),
                body: [swift.Statement.expressionStatement(swift.Expression.reference("handleX"))],
                elseIfs: [
                    {
                        condition: swift.Statement.constantDeclaration("y", swift.Expression.reference("getY()")),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("handleY"))]
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
                condition: swift.Statement.constantDeclaration("a", swift.Expression.reference("getA()")),
                body: [swift.Statement.expressionStatement(swift.Expression.reference("handleA"))],
                elseIfs: [
                    {
                        condition: swift.Statement.constantDeclaration("b", swift.Expression.reference("getB()")),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("handleB"))]
                    },
                    {
                        condition: swift.Statement.constantDeclaration("c", swift.Expression.reference("getC()")),
                        body: [swift.Statement.expressionStatement(swift.Expression.reference("handleC"))]
                    }
                ],
                elseBody: [swift.Statement.expressionStatement(swift.Expression.reference("handleDefault"))]
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
                condition: swift.Statement.constantDeclaration("value", swift.Expression.reference("getValue()")),
                body: [
                    swift.Statement.constantDeclaration("result", swift.Expression.reference("value")),
                    swift.Statement.expressionStatement(swift.Expression.reference("print(result)"))
                ],
                elseIfs: [
                    {
                        condition: swift.Statement.constantDeclaration(
                            "backup",
                            swift.Expression.reference("getBackup()")
                        ),
                        body: [
                            swift.Statement.variableDeclaration("temp", swift.Expression.reference("backup")),
                            swift.Statement.expressionStatement(swift.Expression.reference("useTemp"))
                        ]
                    }
                ],
                elseBody: [
                    swift.Statement.expressionStatement(swift.Expression.reference("print(message)")),
                    swift.Statement.return(swift.Expression.rawValue("false"))
                ]
            });

            expect(ifStatement.toString()).toMatchInlineSnapshot(`
              "if let value = getValue() {
                  let result = value
                  print(result)
              } else if let backup = getBackup() {
                  var temp = backup
                  useTemp
              } else {
                  print(message)
                  return false
              }
              "
            `);
        });
    });
});
