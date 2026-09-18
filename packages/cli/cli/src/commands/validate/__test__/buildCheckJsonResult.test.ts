import { RelativeFilePath } from "@fern-api/fs-utils";
import { describe, expect, it } from "vitest";

import { buildCheckJsonResult } from "../buildCheckJsonResult.js";

describe("buildCheckJsonResult", () => {
    it("includes the file and node path for each violation", () => {
        const result = buildCheckJsonResult({
            apiResults: [
                {
                    apiName: "sdk",
                    elapsedMillis: 1,
                    violations: [
                        {
                            name: "valid-example-error",
                            severity: "fatal",
                            relativeFilepath: RelativeFilePath.of("__package__.yml"),
                            nodePath: ["errors", "BadRequestError", "type"],
                            message: 'Example is missing required property "response.body.messages"'
                        }
                    ]
                }
            ],
            docsResult: undefined,
            hasErrors: true,
            showApiNames: false
        });

        expect(result).toEqual({
            success: false,
            results: {
                apis: [
                    {
                        severity: "fatal",
                        rule: "valid-example-error",
                        path: "__package__.yml -> errors -> BadRequestError -> type",
                        message: 'Example is missing required property "response.body.messages"'
                    }
                ]
            }
        });
    });

    it("omits path when the violation has no file or node path", () => {
        const result = buildCheckJsonResult({
            apiResults: [
                {
                    apiName: "sdk",
                    elapsedMillis: 1,
                    violations: [
                        {
                            severity: "warning",
                            relativeFilepath: RelativeFilePath.of(""),
                            nodePath: [],
                            message: "SDK name inferred"
                        }
                    ]
                }
            ],
            docsResult: undefined,
            hasErrors: false,
            showApiNames: false
        });

        expect(result.results.apis).toEqual([{ severity: "warning", message: "SDK name inferred" }]);
    });
});
