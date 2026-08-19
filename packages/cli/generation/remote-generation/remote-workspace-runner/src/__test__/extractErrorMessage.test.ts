import { describe, expect, it } from "vitest";

import { extractErrorMessage } from "../createAndStartJob.js";

describe("extractErrorMessage", () => {
    it("extracts message from unwrapped Fetcher.Error (the shape passed to _other visitor)", () => {
        // This is the exact shape logged by the CLI for a GithubAppNotInstalled response
        // when Fiddle returns a typed error the SDK can't route to a known case.
        const fetcherError = {
            reason: "status-code",
            statusCode: 400,
            body: {
                error: "GithubAppNotInstalled",
                errorInstanceId: "63b0b27d-6e52-4d9e-9220-e69572ad8b9d",
                content: {
                    message:
                        "Could not find GitHub repository owner/repo. Please check that the repository exists and that the Fern GitHub App (https://github.com/apps/fern-api) is installed on owner/repo.",
                    repositoryName: "owner/repo"
                }
            }
        };
        expect(extractErrorMessage(fetcherError)).toBe(
            "Could not find GitHub repository owner/repo. Please check that the repository exists and that the Fern GitHub App (https://github.com/apps/fern-api) is installed on owner/repo."
        );
    });

    it("extracts message from wrapped SDK error (the shape of createResponse.error)", () => {
        const wrappedError = {
            content: {
                reason: "status-code",
                statusCode: 400,
                body: {
                    error: "GithubAppNotInstalled",
                    content: {
                        message: "The Fern GitHub App is not installed on owner/repo.",
                        repositoryName: "owner/repo"
                    }
                }
            }
        };
        expect(extractErrorMessage(wrappedError)).toBe("The Fern GitHub App is not installed on owner/repo.");
    });

    it("falls back to body.message when body.content.message is missing", () => {
        const fetcherError = {
            reason: "status-code",
            statusCode: 500,
            body: { message: "Something broke" }
        };
        expect(extractErrorMessage(fetcherError)).toBe("Something broke");
    });

    it("returns undefined when the body has no message", () => {
        const fetcherError = {
            reason: "status-code",
            statusCode: 500,
            body: { _error: "_unknown" }
        };
        expect(extractErrorMessage(fetcherError)).toBeUndefined();
    });

    it("returns undefined for non-status-code errors", () => {
        expect(extractErrorMessage({ reason: "timeout" })).toBeUndefined();
        expect(extractErrorMessage({ reason: "unknown", errorMessage: "boom" })).toBeUndefined();
        expect(extractErrorMessage(undefined)).toBeUndefined();
        expect(extractErrorMessage(null)).toBeUndefined();
    });

    it("ignores non-string message fields", () => {
        const fetcherError = {
            reason: "status-code",
            statusCode: 400,
            body: { content: { message: { not: "a string" } } }
        };
        expect(extractErrorMessage(fetcherError)).toBeUndefined();
    });
});
