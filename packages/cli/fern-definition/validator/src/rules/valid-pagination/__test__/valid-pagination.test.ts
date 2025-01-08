import { AbsoluteFilePath, RelativeFilePath, join } from "@fern-api/fs-utils";

import { ValidationViolation } from "../../../ValidationViolation";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidPaginationRule } from "../valid-pagination";

describe("valid-pagination", () => {
    it("valid", async () => {
        const violations = await getViolationsForRule({
            rule: ValidPaginationRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("valid")
            )
        });
        expect(violations).toEqual([]);
    });

    it("invalid", async () => {
        const violations = await getViolationsForRule({
            rule: ValidPaginationRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid")
            )
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message:
                    "Pagination configuration for endpoint listWithPaginationTypos specifies 'cursor' $request.typo, which is not a valid 'cursor' type.",
                nodePath: ["service", "endpoints", "listWithPaginationTypos"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithPaginationTypos specifies 'next_cursor' $response.typo.next.starting_after, which is not a valid 'next_cursor' type.",
                nodePath: ["service", "endpoints", "listWithPaginationTypos"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithPaginationTypos specifies 'results' $response.typo, which is not a valid 'results' type.",
                nodePath: ["service", "endpoints", "listWithPaginationTypos"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidCursorPaginationType specifies 'cursor' $request.user, which is not a valid 'cursor' type.",
                nodePath: ["service", "endpoints", "listWithInvalidCursorPaginationType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidCursorPaginationType specifies 'next_cursor' $response.valid, which is not a valid 'next_cursor' type.",
                nodePath: ["service", "endpoints", "listWithInvalidCursorPaginationType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidOffsetPaginationType specifies 'offset' $request.starting_after, which is not a valid 'offset' type.",
                nodePath: ["service", "endpoints", "listWithInvalidOffsetPaginationType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidOffsetStepPaginationType specifies 'step' $request.limit, which is not a valid 'step' type.",
                nodePath: ["service", "endpoints", "listWithInvalidOffsetStepPaginationType"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidPaginationPrefix must define a dot-delimited 'cursor' property starting with $request (e.g. $request.cursor).",
                nodePath: ["service", "endpoints", "listWithInvalidPaginationPrefix"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidPaginationPrefix must define a dot-delimited 'next_cursor' property starting with $response (e.g. $response.next_cursor).",
                nodePath: ["service", "endpoints", "listWithInvalidPaginationPrefix"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidPaginationPrefix must define a dot-delimited 'results' property starting with $response (e.g. $response.results).",
                nodePath: ["service", "endpoints", "listWithInvalidPaginationPrefix"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidGlobalConfig specifies 'offset' $request.offset, which is not a valid 'offset' type.",
                nodePath: ["service", "endpoints", "listWithInvalidGlobalConfig"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            },
            {
                message:
                    "Pagination configuration for endpoint listWithInvalidGlobalConfig specifies 'results' $response.results, which is not a valid 'results' type.",
                nodePath: ["service", "endpoints", "listWithInvalidGlobalConfig"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error"
            }
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
