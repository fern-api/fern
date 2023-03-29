import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidStreamConditionRule } from "../valid-stream-condition";

describe("valid-stream-condition", () => {
    it("simple", async () => {
        const violations = await getViolationsForRule({
            rule: ValidStreamConditionRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("simple")
            ),
        });

        const expectedViolations = [
            {
                message: "stream-condition can only be used if both response and response-stream are specified.",
                nodePath: ["service", "endpoints", "streamConditionButNoResponse", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
            {
                message: "stream-condition must be specified when both response and response-stream are specified.",
                nodePath: ["service", "endpoints", "responsesButNoStreamCondition", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
            {
                message:
                    "stream-condition is not valid. You should specify a selector for a boolean request property, e.g. $request.yourProperty or $query.yourQueryParameter",
                nodePath: ["service", "endpoints", "invalidStreamCondition", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
            {
                message: "A request body is required when the response can be either streaming or non-streaming.",
                nodePath: ["service", "endpoints", "missingRequestBody", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
            {
                message: 'Property "stream" does not exist on the request.',
                nodePath: ["service", "endpoints", "missingPropertyStreamCondition", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
            {
                message: 'Property "stream" is not a boolean.',
                nodePath: ["service", "endpoints", "nonBooleanStreamCondition", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
            {
                message: 'Query parameter "stream" does not exist on this endpoint.',
                nodePath: ["service", "endpoints", "missingQueryParam", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
            {
                message: 'Query parameter "stream" is not a boolean.',
                nodePath: ["service", "endpoints", "nonBooleanQueryParam", "stream-condition"],
                relativeFilepath: RelativeFilePath.of("simple.yml"),
                severity: "error",
            },
        ];

        expect(violations).toEqual(expectedViolations);
    });
});
