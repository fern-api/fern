import { BasicAuth } from "../../../src/core/auth/BasicAuth";

describe("BasicAuth", () => {
    interface ToHeaderTestCase {
        description: string;
        input: { username: string; password: string };
        expected: string;
    }

    interface FromHeaderTestCase {
        description: string;
        input: string;
        expected: { username: string; password: string };
    }

    interface ErrorTestCase {
        description: string;
        input: string;
        expectedError: string;
    }

    describe("toAuthorizationHeader", () => {
        const toHeaderTests: ToHeaderTestCase[] = [
            {
                description: "correctly converts to header",
                input: { username: "username", password: "password" },
                expected: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
            },
        ];

        toHeaderTests.forEach(({ description, input, expected }) => {
            it(description, () => {
                expect(BasicAuth.toAuthorizationHeader(input)).toBe(expected);
            });
        });
    });

    describe("fromAuthorizationHeader", () => {
        const fromHeaderTests: FromHeaderTestCase[] = [
            {
                description: "correctly parses header",
                input: "Basic dXNlcm5hbWU6cGFzc3dvcmQ=",
                expected: { username: "username", password: "password" },
            },
            {
                description: "handles password with colons",
                input: "Basic dXNlcjpwYXNzOndvcmQ=",
                expected: { username: "user", password: "pass:word" },
            },
            {
                description: "handles empty username and password (just colon)",
                input: "Basic Og==",
                expected: { username: "", password: "" },
            },
            {
                description: "handles empty username",
                input: "Basic OnBhc3N3b3Jk",
                expected: { username: "", password: "password" },
            },
            {
                description: "handles empty password",
                input: "Basic dXNlcm5hbWU6",
                expected: { username: "username", password: "" },
            },
        ];

        fromHeaderTests.forEach(({ description, input, expected }) => {
            it(description, () => {
                expect(BasicAuth.fromAuthorizationHeader(input)).toEqual(expected);
            });
        });

        const errorTests: ErrorTestCase[] = [
            {
                description: "throws error for completely empty credentials",
                input: "Basic ",
                expectedError: "Invalid basic auth",
            },
            {
                description: "throws error for credentials without colon",
                input: "Basic dXNlcm5hbWU=",
                expectedError: "Invalid basic auth",
            },
        ];

        errorTests.forEach(({ description, input, expectedError }) => {
            it(description, () => {
                expect(() => BasicAuth.fromAuthorizationHeader(input)).toThrow(expectedError);
            });
        });
    });
});
