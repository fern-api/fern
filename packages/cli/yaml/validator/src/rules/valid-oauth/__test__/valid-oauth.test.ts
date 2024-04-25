import { AbsoluteFilePath, join, RelativeFilePath } from "@fern-api/fs-utils";
import { getViolationsForRule } from "../../../testing-utils/getViolationsForRule";
import { ValidationViolation } from "../../../ValidationViolation";
import { ValidOauthRule } from "../valid-oauth";

describe("valid-oauth", () => {
    it("valid", async () => {
        const violations = await getViolationsForRule({
            rule: ValidOauthRule,
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
            rule: ValidOauthRule,
            absolutePathToWorkspace: join(
                AbsoluteFilePath.of(__dirname),
                RelativeFilePath.of("fixtures"),
                RelativeFilePath.of("invalid")
            )
        });
        const expectedViolations: ValidationViolation[] = [
            {
                message:
                    "OAuth configuration for endpoint getTokenWithClientCredentials specifies 'access-token' $response.missing.access_token, which is not a valid 'access-token' type.",
                nodePath: ["service", "endpoints", "getTokenWithClientCredentials"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint getTokenWithClientCredentials specifies 'expires-in' $response.missing.expires_in, which is not a valid 'expires-in' type.",
                nodePath: ["service", "endpoints", "getTokenWithClientCredentials"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $request.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'access-token' $response.accessTokenDoesNotExist, which is not a valid 'access-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'expires-in' $response.expiresInDoesNotExist, which is not a valid 'expires-in' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            },
            {
                message:
                    "OAuth configuration for endpoint refreshToken specifies 'refresh-token' $response.refreshTokenDoesNotExist, which is not a valid 'refresh-token' type.",
                nodePath: ["service", "endpoints", "refreshToken"],
                relativeFilepath: RelativeFilePath.of("auth.yml"),
                severity: "error"
            }
        ];
        expect(violations).toEqual(expectedViolations);
    });
});
