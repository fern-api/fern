import { describe, expect, it } from "vitest";

import { swift } from "../../../index.js";

describe("Statement.doCatch", () => {
    it("should write a do-catch statement with a qualified enum case pattern", () => {
        const statement = swift.Statement.doCatch({
            body: [swift.Statement.raw("try doSomething()")],
            catches: [
                {
                    pattern: swift.Pattern.enumCaseValueBinding({
                        enumTypeName: "ApiError",
                        caseName: "httpError",
                        declarationType: swift.DeclarationType.Let,
                        referenceName: "httpError"
                    }),
                    body: [swift.Statement.raw("handle(httpError)")]
                },
                { body: [swift.Statement.raw("handleOther()")] }
            ]
        });

        expect(statement.toString()).toMatchInlineSnapshot(`
          "do {
              try doSomething()
          } catch ApiError.httpError(let httpError) {
              handle(httpError)
          } catch {
              handleOther()
          }
          "
        `);
    });
});
