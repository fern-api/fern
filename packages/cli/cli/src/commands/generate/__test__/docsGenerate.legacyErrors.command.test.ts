import { describe, expect, it, vi } from "vitest";

import {
    FAKE_TIMEOUTS,
    ONE_PAGE,
    OPENAPI_DOCS,
    settleWithFakeTimers,
    useDocsEnvironment
} from "./docsGenerateHarness.js";

// `publishDocs` and `runRemoteGenerationForDocsWorkspace` read failures of FDR in an older shape than the FDR client
// produces today: `{ error, content: { reason: "status-code", statusCode, body } }`. With the client as it is, those
// messages and the wait-and-retry for a 409 can never run (docsGenerate.errors.command.test.ts shows what happens
// instead). These tests make the FDR client fail in the older shape, with the same HTTP answers, to cover that code.

const olderShape = vi.hoisted(() => {
    interface ClientError {
        status?: number;
        message?: string;
        data?: { body?: unknown };
    }
    const isClientError = (value: unknown): value is ClientError =>
        typeof value === "object" && value != null && "status" in value;

    function toOlderShape(error: unknown): unknown {
        if (!isClientError(error)) {
            return error;
        }
        const body = error.data?.body;
        const named =
            typeof body === "object" && body != null && "error" in body
                ? (body as { error: unknown }).error
                : undefined;
        return {
            error: typeof named === "string" ? named : undefined,
            content: { reason: "status-code", statusCode: error.status, body, errorMessage: error.message }
        };
    }

    // The client is a chain of callable proxies (`fdr.docs.v2.write.startDocsRegister(...)`), so every step is wrapped.
    function wrap<T extends object>(target: T): T {
        return new Proxy(target, {
            get(object, property, receiver) {
                const value = Reflect.get(object, property, receiver);
                return (typeof value === "object" || typeof value === "function") && value != null
                    ? wrap(value)
                    : value;
            },
            apply(object, thisArgument, args) {
                const call = (): unknown =>
                    Reflect.apply(object as unknown as (...inner: unknown[]) => unknown, thisArgument, args);
                try {
                    const result = call();
                    return result instanceof Promise
                        ? result.catch((error: unknown) => {
                              throw toOlderShape(error);
                          })
                        : result;
                } catch (error) {
                    throw toOlderShape(error);
                }
            }
        });
    }
    return { wrap };
});

vi.mock("@fern-api/core", async (importOriginal) => {
    const original = await importOriginal<typeof import("@fern-api/core")>();
    return {
        ...original,
        createFdrService: (...args: Parameters<typeof original.createFdrService>) =>
            olderShape.wrap(original.createFdrService(...args))
    };
});

const INIT = "POST /v2/registry/docs/v2/init";
const UNLOCK = "http://fdr.test/docs-deployment/unlock";

describe("fern generate --docs: failures of the legacy registration, in the older error shape", {
    timeout: 60_000
}, () => {
    const env = useDocsEnvironment();

    const failWith = async (status: number, body: unknown) => {
        env.setDeployMode("legacy");
        env.fdr.reply(INIT, { status, body });
        return env.attempt(env.project(ONE_PAGE));
    };

    describe("401 and 403", () => {
        const DASHBOARD =
            "Please ensure you have membership at https://dashboard.buildwithfern.com, and ask a team member for an invite if not.";

        it("tells the user an invalid or expired token to log in again", async () => {
            const { errors } = await failWith(401, { code: "UNAUTHORIZED", message: "Invalid authorization token" });

            expect(errors).toEqual([
                "Your authentication token is invalid or expired. Please run 'fern login' to re-authenticate."
            ]);
        });

        it("tells the user who cannot publish under the organization to log in with the right account", async () => {
            const { errors } = await failWith(401, { code: "UNAUTHORIZED", message: "nope" });

            expect(errors).toEqual([
                `You are not authorized to publish docs under organization 'acme'. Please run 'fern login' to ensure you are logged in with the correct account.\n\n${DASHBOARD}`
            ]);
        });

        it("tells a user who is not a member of the organization how to join it", async () => {
            const { errors } = await failWith(403, {
                code: "FORBIDDEN",
                message: "User does not belong to organization acme"
            });

            expect(errors).toEqual([
                `You are not a member of organization 'acme'. Please run 'fern login' to ensure you are logged in with the correct account.\n\n${DASHBOARD}`
            ]);
        });

        it("passes on FDR's own words for any other reason it is forbidden", async () => {
            const { errors } = await failWith(403, {
                code: "FORBIDDEN",
                message: "The domain belongs to another organization."
            });

            expect(errors).toEqual(["The domain belongs to another organization."]);
        });

        it("says the user may not publish to the domain when FDR gave no reason", async () => {
            const { errors } = await failWith(403, { code: "FORBIDDEN" });

            expect(errors).toEqual([
                "You do not have permission to publish docs to 'acme.docs.buildwithfern.com' under organization 'acme'."
            ]);
        });

        it("tells the user it was FDR's fault when FDR says its server failed", async () => {
            const { errors } = await failWith(401, { code: "INTERNAL_SERVER_ERROR" });

            expect(errors).toEqual([
                "An internal server error occurred while publishing docs to 'acme.docs.buildwithfern.com'. Please try again or reach out to support@buildwithfern.com for assistance."
            ]);
        });

        it("uses the message of an answer FDR gave as plain text", async () => {
            const { errors } = await failWith(403, "Blocked by policy");

            expect(errors).toEqual(["Blocked by policy"]);
        });

        it("points to support when FDR gave nothing to quote", async () => {
            const { errors } = await failWith(403, {});

            expect(errors[0]).toBe(
                "Failed to publish docs to 'acme.docs.buildwithfern.com'. Please reach out to support@buildwithfern.com for assistance."
            );
        });

        it("sends nothing after the failure and has no lock to release", async () => {
            const { error } = await failWith(401, { code: "UNAUTHORIZED" });

            expect(error).toBeDefined();
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")).toEqual([]);
            expect(env.axiosCalls).toEqual([]);
        });

        it("says the same for a preview", async () => {
            env.setDeployMode("legacy");
            env.fdr.reply("POST /v2/registry/docs/preview/init", {
                status: 403,
                body: { code: "FORBIDDEN", message: "User does not belong to organization acme" }
            });

            const { errors } = await env.attempt(env.project(ONE_PAGE), { preview: true });

            expect(errors[0]).toContain("You are not a member of organization 'acme'.");
        });
    });

    describe("errors FDR names", () => {
        it("explains a domain that does not end with FDR's suffix", async () => {
            const { errors } = await failWith(400, { error: "InvalidCustomDomainError" });

            expect(errors).toEqual(["Your docs domain should end with docs.buildwithfern.com"]);
        });

        it("uses the suffix a self-hosted FDR sets", async () => {
            vi.stubEnv("DOCS_DOMAIN_SUFFIX", "docs.internal.example");

            const { errors } = await failWith(400, { error: "InvalidCustomDomainError" });

            expect(errors).toEqual(["Your docs domain should end with docs.internal.example"]);
        });

        it("explains custom domains where one is part of another", async () => {
            const { errors } = await failWith(400, { error: "InvalidDomainError" });

            expect(errors).toEqual([
                "Please make sure that none of your custom domains are not overlapping (i.e. one is a substring of another)"
            ]);
        });

        it("explains an unauthorized answer FDR named", async () => {
            const { errors } = await failWith(400, { error: "UnauthorizedError", code: "UNAUTHORIZED" });

            expect(errors[0]).toContain("You are not authorized to publish docs under organization 'acme'.");
        });

        it("points to support for an unauthorized answer that says no more", async () => {
            const { errors } = await failWith(400, { error: "UnauthorizedError" });

            expect(errors).toEqual([
                "Failed to publish docs to 'acme.docs.buildwithfern.com'. Please reach out to support@buildwithfern.com for assistance."
            ]);
        });

        it("explains a user who is not in the organization", async () => {
            const { errors } = await failWith(400, { error: "UserNotInOrgError" });

            expect(errors[0]).toContain("You do not belong to organization 'acme'. Please run 'fern login'");
        });

        it("asks the user to try again when FDR says it is unavailable", async () => {
            const { errors } = await failWith(400, { error: "UnavailableError" });

            expect(errors).toEqual([
                "Failed to publish docs. Please try again later or reach out to Fern support at support@buildwithfern.com."
            ]);
        });

        it("gives the plain failure for an error it does not know", async () => {
            const { errors } = await failWith(400, { error: "SomethingNew" });

            expect(errors[0]?.startsWith("Failed to publish docs. {")).toBe(true);
        });

        it("tells PostHog what FDR answered", async () => {
            const { events } = await failWith(400, { error: "InvalidDomainError" });

            expect(events[1]).toMatchObject({
                command: "docs-generation",
                properties: { error: expect.stringContaining("InvalidDomainError") }
            });
        });
    });

    describe("another publish is running (409)", () => {
        const RETRY = (minutes: number, attempt: number): string =>
            `warn: Another docs publish is in progress. Retrying in ${minutes} minute${minutes === 1 ? "" : "s"} (attempt ${attempt}/3)...`;

        it("waits one minute, then five, then five, and tries a fourth time before giving up", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.setDeployMode("legacy");
            env.fdr.reply(INIT, { status: 409, body: {} });

            const { error, errors, logs } = await settleWithFakeTimers(env.attempt(env.project(ONE_PAGE)), 10_000);

            expect(error).toBeDefined();
            expect(env.fdr.to(INIT)).toHaveLength(4);
            expect(
                logs.filter((line) => line.startsWith("warn: Another docs publish is in progress")).map((line) => line)
            ).toEqual([RETRY(1, 1), RETRY(5, 2), RETRY(5, 3)]);
            expect(errors).toEqual([
                "Another docs publish is currently in progress. Please try again once the other publish is complete."
            ]);
        });

        it("does not try again before the wait is over", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.setDeployMode("legacy");
            env.fdr.reply(INIT, { status: 409, body: {} });
            const pending = env.attempt(env.project(ONE_PAGE));

            await vi.waitFor(() => expect(env.fdr.to(INIT)).toHaveLength(1));
            await vi.advanceTimersByTimeAsync(59_000);
            expect(env.fdr.to(INIT)).toHaveLength(1);
            await vi.advanceTimersByTimeAsync(1_000);
            await vi.waitFor(() => expect(env.fdr.to(INIT)).toHaveLength(2));
            await settleWithFakeTimers(pending, 60_000);
        });

        it("publishes when the other publish has finished by the time it tries again", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.setDeployMode("legacy");
            env.fdr.replyTimes(INIT, 1, { status: 409, body: {} });

            const { logs } = await settleWithFakeTimers(env.run(env.project(ONE_PAGE)), 10_000);

            expect(env.fdr.to(INIT)).toHaveLength(2);
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")).toHaveLength(1);
            expect(logs.filter((line) => line.startsWith("warn: Another docs publish"))).toEqual([RETRY(1, 1)]);
            expect(logs.some((line) => line.startsWith("info: Published docs to"))).toBe(true);
        });

        it("publishes on the last try", async () => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.setDeployMode("legacy");
            env.fdr.replyTimes(INIT, 3, { status: 409, body: {} });

            await settleWithFakeTimers(env.run(env.project(ONE_PAGE)), 10_000);

            expect(env.fdr.to(INIT)).toHaveLength(4);
            expect(env.fdr.to("POST /v2/registry/docs/register/registration-1")).toHaveLength(1);
        });

        it("does not wait for a preview that is refused another way", async () => {
            env.setDeployMode("legacy");
            env.fdr.reply("POST /v2/registry/docs/preview/init", { status: 500, body: {} });

            const { error } = await env.attempt(env.project(ONE_PAGE), { preview: true });

            expect(error).toBeDefined();
            expect(env.fdr.to("POST /v2/registry/docs/preview/init")).toHaveLength(1);
        });

        it("does not wait when anything else fails", async () => {
            const { errors } = await failWith(500, {});

            expect(env.fdr.to(INIT)).toHaveLength(1);
            expect(errors[0]?.startsWith("Failed to publish docs.")).toBe(true);
        });
    });

    describe("registering an API", () => {
        it("does not retry a refusal that is not transient (400)", async () => {
            env.setDeployMode("legacy");
            env.stubAxios("post", () => ({}));
            env.fdr.reply("POST /registry/api/register", { status: 400, body: {} });

            const { error } = await env.attempt(env.project(OPENAPI_DOCS));

            expect(error).toBeDefined();
            expect(env.fdr.to("POST /registry/api/register")).toHaveLength(1);
            expect(env.axiosCalls.map((call) => call.url)).toEqual([UNLOCK]);
        });

        it("does not retry a 401 or a 403 either", async () => {
            env.fdr.reply("POST /registry/api/register", { status: 403, body: {} });

            await env.attempt(env.project(OPENAPI_DOCS));

            expect(env.fdr.to("POST /registry/api/register")).toHaveLength(1);
        });

        it.each([429, 500, 502])("retries a %i", async (status) => {
            vi.useFakeTimers({ toFake: FAKE_TIMEOUTS });
            env.fdr.replyTimes("POST /registry/api/register", 1, { status, body: {} });

            await settleWithFakeTimers(env.run(env.project(OPENAPI_DOCS)));

            expect(env.fdr.to("POST /registry/api/register")).toHaveLength(2);
        });
    });
});
