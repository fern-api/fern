import { describe, expect, it } from "vitest";

import { getResponseErrorClassName } from "../wire-tests/WireTestExampleSelector.js";

// Pins the status code -> error class table to ResponseError.subclass_for_code in
// generators/ruby-v2/base/src/asIs/errors/response_error.Template.rb. Update both together.
describe("getResponseErrorClassName", () => {
    it.each([
        [300, "RedirectError"],
        [301, "RedirectError"],
        [399, "RedirectError"],
        [400, "ClientError"],
        [401, "UnauthorizedError"],
        [403, "ForbiddenError"],
        [404, "NotFoundError"],
        [409, "ClientError"],
        [422, "ClientError"],
        [429, "ClientError"],
        [499, "ClientError"],
        [500, "ServerError"],
        [502, "ServerError"],
        [503, "ServiceUnavailableError"],
        [504, "ServerError"],
        [599, "ServerError"],
        [200, "ResponseError"],
        [299, "ResponseError"],
        [600, "ResponseError"]
    ])("maps %i to %s", (statusCode, className) => {
        expect(getResponseErrorClassName(statusCode)).toBe(className);
    });
});
