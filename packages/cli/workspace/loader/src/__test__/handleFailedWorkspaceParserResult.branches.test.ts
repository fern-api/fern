import { RelativeFilePath } from "@fern-api/fs-utils";
import { WorkspaceLoader, WorkspaceLoaderFailureType } from "@fern-api/lazy-fern-workspace";
import yaml from "js-yaml";
import { stripVTControlCharacters } from "util";
import { describe, expect, it } from "vitest";
import { ZodError, z } from "zod";

import {
    handleFailedWorkspaceParserResult,
    handleFailedWorkspaceParserResultRaw
} from "../handleFailedWorkspaceParserResult.js";
import { createMockLogger, loggedMessages } from "./createMockLogger.js";

function handle(failures: Record<string, WorkspaceLoader.Failure>): string[] {
    const logger = createMockLogger();
    handleFailedWorkspaceParserResult(
        { didSucceed: false, failures: failures as Record<RelativeFilePath, WorkspaceLoader.Failure> },
        logger
    );
    return loggedMessages(logger.error).map(stripVTControlCharacters);
}

function thrownZodError(fn: () => unknown): { success: false; error: ZodError } {
    try {
        fn();
    } catch (error) {
        if (error instanceof ZodError) {
            return { success: false, error };
        }
        throw error;
    }
    throw new Error("Expected a ZodError to be thrown");
}

function zodErrorFrom(result: { success: boolean; error?: ZodError }): ZodError {
    if (result.success || result.error == null) {
        throw new Error("Expected a failed parse");
    }
    return result.error;
}

function jsonSchemaError(
    error: Partial<NonNullable<WorkspaceLoader.JsonSchemaValidationFailure["error"]["error"]>> | undefined
): WorkspaceLoader.JsonSchemaValidationFailure {
    return {
        type: WorkspaceLoaderFailureType.JSONSCHEMA_VALIDATION,
        error: {
            success: false,
            error:
                error == null
                    ? undefined
                    : { instancePath: "", schemaPath: "#", keyword: "type", params: {}, message: "Unknown", ...error },
            allErrors: []
        }
    };
}

describe("handleFailedWorkspaceParserResult", () => {
    describe("simple failure types", () => {
        const simpleFailures: { name: string; failure: WorkspaceLoader.Failure; expected: string[] }[] = [
            {
                name: "MISCONFIGURED_DIRECTORY",
                failure: { type: WorkspaceLoaderFailureType.MISCONFIGURED_DIRECTORY },
                expected: [
                    "No API definition found. Expected one of the following:\n" +
                        "  - An api section in generators.yml pointing to your API spec(s)\n" +
                        "  - A definition/ directory with Fern Definition files\n" +
                        "For more information, see https://buildwithfern.com/learn/api-definition/introduction/what-is-the-fern-folder"
                ]
            },
            {
                name: "FILE_READ",
                failure: { type: WorkspaceLoaderFailureType.FILE_READ, error: new Error("EACCES") },
                expected: ["Failed to open file: api/spec.yml"]
            },
            {
                name: "FILE_MISSING",
                failure: { type: WorkspaceLoaderFailureType.FILE_MISSING },
                expected: ["Missing file: api/spec.yml"]
            },
            {
                name: "ABSOLUTE_FILEPATH",
                failure: { type: WorkspaceLoaderFailureType.ABSOLUTE_FILEPATH, filepath: "/abs/spec.yml" },
                expected: [
                    "OpenAPI spec paths must be relative to the Fern workspace. Found absolute path: /abs/spec.yml"
                ]
            },
            {
                name: "FAILED_TO_LOAD_DEPENDENCY",
                failure: { type: WorkspaceLoaderFailureType.FAILED_TO_LOAD_DEPENDENCY, dependencyName: "@acme/api" },
                expected: ["Failed to load dependency: @acme/api"]
            },
            {
                name: "DEPENDENCY_NOT_LISTED",
                failure: { type: WorkspaceLoaderFailureType.DEPENDENCY_NOT_LISTED, dependencyName: "@acme/api" },
                expected: ["Dependency is not listed in dependencies.yml: @acme/api"]
            },
            {
                name: "EXPORT_PACKAGE_HAS_DEFINITIONS",
                failure: {
                    type: WorkspaceLoaderFailureType.EXPORT_PACKAGE_HAS_DEFINITIONS,
                    pathToPackage: RelativeFilePath.of("pkg/dir")
                },
                expected: ["Exported package contains API definitions: pkg/dir"]
            },
            {
                name: "EXPORTING_PACKAGE_MARKER_OTHER_KEYS",
                failure: {
                    type: WorkspaceLoaderFailureType.EXPORTING_PACKAGE_MARKER_OTHER_KEYS,
                    pathOfPackageMarker: RelativeFilePath.of("pkg/__package__.yml")
                },
                expected: ["pkg/__package__.yml has an export so it cannot define other keys."]
            }
        ];

        it.each(simpleFailures)("formats $name", ({ failure, expected }) => {
            expect(handle({ "api/spec.yml": failure })).toEqual(expected);
        });

        it("logs nothing when there are no failures", () => {
            expect(handle({})).toEqual([]);
        });

        it("logs one entry per failing file, in insertion order", () => {
            const messages = handle({
                "a.yml": { type: WorkspaceLoaderFailureType.FILE_MISSING },
                "b.yml": { type: WorkspaceLoaderFailureType.FILE_READ, error: undefined },
                "c.yml": { type: WorkspaceLoaderFailureType.FILE_MISSING }
            });

            expect(messages).toEqual(["Missing file: a.yml", "Failed to open file: b.yml", "Missing file: c.yml"]);
        });

        it("throws for an unknown failure type", () => {
            const unknownFailure = { type: "SOMETHING_NEW" } as unknown as WorkspaceLoader.Failure;

            expect(() => handle({ "a.yml": unknownFailure })).toThrow('Unexpected value: {"type":"SOMETHING_NEW"}');
        });

        it("stops at the first unknown failure type, after logging the earlier ones", () => {
            const logger = createMockLogger();
            const failures = {
                "a.yml": { type: WorkspaceLoaderFailureType.FILE_MISSING },
                "b.yml": { type: "SOMETHING_NEW" } as unknown as WorkspaceLoader.Failure,
                "c.yml": { type: WorkspaceLoaderFailureType.FILE_MISSING }
            } as Record<RelativeFilePath, WorkspaceLoader.Failure>;

            expect(() => handleFailedWorkspaceParserResult({ didSucceed: false, failures }, logger)).toThrow();
            expect(loggedMessages(logger.error)).toEqual(["Missing file: a.yml"]);
        });
    });

    describe("handleFailedWorkspaceParserResultRaw", () => {
        it("formats a record of failures the same way", () => {
            const logger = createMockLogger();
            handleFailedWorkspaceParserResultRaw(
                {
                    [RelativeFilePath.of("x.yml")]: { type: WorkspaceLoaderFailureType.FILE_MISSING },
                    [RelativeFilePath.of("y.yml")]: {
                        type: WorkspaceLoaderFailureType.ABSOLUTE_FILEPATH,
                        filepath: "/y.yml"
                    }
                },
                logger
            );

            expect(loggedMessages(logger.error)).toEqual([
                "Missing file: x.yml",
                "OpenAPI spec paths must be relative to the Fern workspace. Found absolute path: /y.yml"
            ]);
        });
    });

    describe("FILE_PARSE", () => {
        function yamlException(): yaml.YAMLException {
            try {
                yaml.load("a: [\n");
            } catch (error) {
                if (error instanceof yaml.YAMLException) {
                    return error;
                }
            }
            throw new Error("Expected a YAMLException");
        }

        it("includes the reason and a snippet for a YAML syntax error", () => {
            const error = yamlException();
            const [message, ...rest] = handle({ "def/a.yml": { type: WorkspaceLoaderFailureType.FILE_PARSE, error } });

            expect(rest).toEqual([]);
            expect(message).toBe(`Failed to parse def/a.yml: ${error.reason}\n${error.mark.snippet}`);
            expect(message).toContain("unexpected end of the stream within a flow collection");
        });

        it.each([
            { name: "an Error", error: new Error("boom") },
            { name: "a string", error: "boom" },
            { name: "undefined", error: undefined }
        ])("falls back to a generic message when the error is $name", ({ error }) => {
            expect(handle({ "def/a.yml": { type: WorkspaceLoaderFailureType.FILE_PARSE, error } })).toEqual([
                "Failed to parse file: def/a.yml"
            ]);
        });
    });

    describe("STRUCTURE_VALIDATION", () => {
        const fileSchema = z.object({ name: z.string(), nested: z.object({ count: z.number() }).strict() });

        function structureFailure(error: ZodError): WorkspaceLoader.Failure {
            return { type: WorkspaceLoaderFailureType.STRUCTURE_VALIDATION, error };
        }

        it("formats an invalid_type issue with breadcrumbs, expected and received", () => {
            const error = zodErrorFrom(fileSchema.safeParse({ name: 5, nested: { count: 1 } }));

            expect(handle({ "def/a.yml": structureFailure(error) })).toEqual([
                "def/a.yml -> name\nIncorrect type\nExpected string but received number"
            ]);
        });

        it("includes nested path segments (including array indexes) in the breadcrumbs", () => {
            const schema = z.object({ items: z.array(z.object({ id: z.string() })) });
            const error = zodErrorFrom(schema.safeParse({ items: [{ id: "ok" }, { id: 7 }] }));

            expect(handle({ "def/a.yml": structureFailure(error) })).toEqual([
                "def/a.yml -> items -> 1 -> id\nIncorrect type\nExpected string but received number"
            ]);
        });

        it("formats a missing required key as an invalid_type issue (received undefined)", () => {
            const error = zodErrorFrom(fileSchema.safeParse({ nested: { count: 1 } }));

            expect(handle({ "def/a.yml": structureFailure(error) })).toEqual([
                "def/a.yml -> name\nIncorrect type\nExpected string but received undefined"
            ]);
        });

        it("logs one entry for each unrecognized key", () => {
            const error = zodErrorFrom(fileSchema.safeParse({ name: "n", nested: { count: 1, extra: 1, other: 2 } }));

            expect(handle({ "def/a.yml": structureFailure(error) })).toEqual([
                "def/a.yml -> nested\nUnexpected key\nEncountered unexpected key extra",
                "def/a.yml -> nested\nUnexpected key\nEncountered unexpected key other"
            ]);
        });

        it("lists the allowed values for an invalid enum value", () => {
            const error = zodErrorFrom(z.object({ kind: z.enum(["alpha", "beta"]) }).safeParse({ kind: "gamma" }));

            expect(handle({ "def/a.yml": structureFailure(error) })).toEqual([
                "def/a.yml -> kind\nUnrecognized value\nAllowed values: alpha, beta"
            ]);
        });

        it.each([
            {
                name: "invalid_union",
                result: () => z.object({ v: z.union([z.string(), z.number()]) }).safeParse({ v: true }),
                message: "Invalid input"
            },
            {
                name: "invalid_string",
                result: () => z.object({ v: z.string().email() }).safeParse({ v: "nope" }),
                message: "Invalid email"
            },
            {
                name: "too_small",
                result: () => z.object({ v: z.string().min(3) }).safeParse({ v: "a" }),
                message: "String must contain at least 3 character(s)"
            },
            {
                name: "too_big",
                result: () => z.object({ v: z.number().max(3) }).safeParse({ v: 10 }),
                message: "Number must be less than or equal to 3"
            },
            {
                name: "invalid_date",
                result: () => z.object({ v: z.date() }).safeParse({ v: new Date("nope") }),
                message: "Invalid date"
            },
            {
                name: "not_multiple_of",
                result: () => z.object({ v: z.number().multipleOf(5) }).safeParse({ v: 7 }),
                message: "Number must be a multiple of 5"
            },
            {
                name: "custom",
                result: () => z.object({ v: z.string().refine(() => false, "custom failure") }).safeParse({ v: "x" }),
                message: "custom failure"
            },
            {
                name: "invalid_arguments",
                result: () =>
                    thrownZodError(() =>
                        z
                            .function()
                            .args(z.string())
                            .implement(() => "ok")(1 as never)
                    ),
                message: "Invalid function arguments",
                breadcrumbs: ""
            },
            {
                name: "invalid_return_type",
                result: () =>
                    thrownZodError(() =>
                        z
                            .function()
                            .returns(z.string())
                            .implement(() => 1 as never)()
                    ),
                message: "Invalid function return type",
                breadcrumbs: ""
            },
            {
                name: "invalid_intersection_types",
                result: () =>
                    z
                        .object({
                            v: z.intersection(
                                z.string().transform(() => 1),
                                z.string().transform(() => 2)
                            )
                        })
                        .safeParse({ v: "x" }),
                message: "Intersection results could not be merged"
            }
        ])("uses only the zod message for $name issues", ({ result, message, breadcrumbs }) => {
            const error = zodErrorFrom(result());

            expect(handle({ "def/a.yml": structureFailure(error) })).toEqual([
                `def/a.yml${breadcrumbs ?? " -> v"}\n${message}`
            ]);
        });

        it("logs every issue of the error", () => {
            const error = zodErrorFrom(fileSchema.safeParse({ name: 1, nested: { count: "x" } }));

            expect(handle({ "def/a.yml": structureFailure(error) })).toEqual([
                "def/a.yml -> name\nIncorrect type\nExpected string but received number",
                "def/a.yml -> nested -> count\nIncorrect type\nExpected number but received string"
            ]);
        });

        it("logs nothing for an error without issues", () => {
            expect(handle({ "def/a.yml": structureFailure(new ZodError([])) })).toEqual([]);
        });
    });

    describe("JSONSCHEMA_VALIDATION", () => {
        it("logs nothing when the validation failure has no primary error", () => {
            expect(handle({ "docs.yml": jsonSchemaError(undefined) })).toEqual([]);
        });

        it("uses the message and the instance path as breadcrumbs", () => {
            const failure = jsonSchemaError({ instancePath: "/navigation/0/page", message: "must be string" });

            expect(handle({ "docs.yml": failure })).toEqual(["docs.yml -> navigation -> 0 -> page\nmust be string"]);
        });

        it("has no extra breadcrumbs for a root-level error", () => {
            expect(handle({ "docs.yml": jsonSchemaError({ instancePath: "", message: "must be object" }) })).toEqual([
                "docs.yml\nmust be object"
            ]);
        });

        it("falls back to 'Unknown error' when the error has no message", () => {
            const failure = jsonSchemaError({ instancePath: "/a", message: undefined });

            expect(handle({ "docs.yml": failure })).toEqual(["docs.yml -> a\nUnknown error"]);
        });

        it("decodes JSON pointer escapes in path segments", () => {
            const failure = jsonSchemaError({ instancePath: "/paths/~1users~1{id}/a~0b", message: "bad" });

            expect(handle({ "docs.yml": failure })).toEqual(["docs.yml -> paths -> /users/{id} -> a~b\nbad"]);
        });

        it("appends the missing property for a `required` error", () => {
            const failure = jsonSchemaError({
                instancePath: "/instances/0",
                keyword: "required",
                params: { missingProperty: "url" },
                message: "must have required property 'url'"
            });

            expect(handle({ "docs.yml": failure })).toEqual([
                "docs.yml -> instances -> 0 -> url\nmust have required property 'url'"
            ]);
        });

        it("appends the additional property for an `additionalProperties` error", () => {
            const failure = jsonSchemaError({
                instancePath: "/colors",
                keyword: "additionalProperties",
                params: { additionalProperty: "bogus" },
                message: "must NOT have additional properties"
            });

            expect(handle({ "docs.yml": failure })).toEqual([
                "docs.yml -> colors -> bogus\nmust NOT have additional properties"
            ]);
        });

        it.each([
            { name: "required without a missingProperty", keyword: "required", params: {} },
            { name: "additionalProperties without an additionalProperty", keyword: "additionalProperties", params: {} },
            { name: "required with an empty missingProperty", keyword: "required", params: { missingProperty: "" } },
            { name: "a keyword that carries a missingProperty", keyword: "type", params: { missingProperty: "url" } },
            {
                name: "a keyword that carries an additionalProperty",
                keyword: "type",
                params: { additionalProperty: "x" }
            }
        ])("does not append a property for $name", ({ keyword, params }) => {
            const failure = jsonSchemaError({ instancePath: "/a", keyword, params, message: "msg" });

            expect(handle({ "docs.yml": failure })).toEqual(["docs.yml -> a\nmsg"]);
        });

        it("does not log secondary errors from allErrors", () => {
            const failure = jsonSchemaError({ instancePath: "/a", message: "primary" });
            failure.error.allErrors = [
                { instancePath: "/b", schemaPath: "#", keyword: "type", params: {}, message: "secondary" }
            ];

            expect(handle({ "docs.yml": failure })).toEqual(["docs.yml -> a\nprimary"]);
        });
    });
});
