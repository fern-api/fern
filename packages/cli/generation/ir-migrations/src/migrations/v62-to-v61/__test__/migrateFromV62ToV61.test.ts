import { createMockTaskContext } from "@fern-api/task-context";

import { IrVersions } from "../../../ir-versions";
import { V62_TO_V61_MIGRATION } from "../migrateFromV62ToV61";

describe("migrateFromV62ToV61", () => {
    it("filters out wildcard status code errors", () => {
        const v62IR: Partial<IrVersions.V62.IntermediateRepresentation> = {
            errors: {
                error_NotFoundError: {
                    name: {
                        errorId: "error_NotFoundError",
                        name: {
                            originalName: "NotFoundError",
                            camelCase: {
                                unsafeName: "notFoundError",
                                safeName: "notFoundError"
                            },
                            snakeCase: {
                                unsafeName: "not_found_error",
                                safeName: "not_found_error"
                            },
                            screamingSnakeCase: {
                                unsafeName: "NOT_FOUND_ERROR",
                                safeName: "NOT_FOUND_ERROR"
                            },
                            pascalCase: {
                                unsafeName: "NotFoundError",
                                safeName: "NotFoundError"
                            }
                        },
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        }
                    },
                    discriminantValue: {
                        name: {
                            originalName: "NotFoundError",
                            camelCase: {
                                unsafeName: "notFoundError",
                                safeName: "notFoundError"
                            },
                            snakeCase: {
                                unsafeName: "not_found_error",
                                safeName: "not_found_error"
                            },
                            screamingSnakeCase: {
                                unsafeName: "NOT_FOUND_ERROR",
                                safeName: "NOT_FOUND_ERROR"
                            },
                            pascalCase: {
                                unsafeName: "NotFoundError",
                                safeName: "NotFoundError"
                            }
                        },
                        wireValue: "NotFoundError"
                    },
                    statusCode: 404,
                    isWildcardStatusCode: false,
                    type: undefined,
                    displayName: undefined,
                    examples: [],
                    v2Examples: undefined,
                    headers: undefined,
                    docs: undefined
                },
                error_WildcardServerError: {
                    name: {
                        errorId: "error_WildcardServerError",
                        name: {
                            originalName: "WildcardServerError",
                            camelCase: {
                                unsafeName: "wildcardServerError",
                                safeName: "wildcardServerError"
                            },
                            snakeCase: {
                                unsafeName: "wildcard_server_error",
                                safeName: "wildcard_server_error"
                            },
                            screamingSnakeCase: {
                                unsafeName: "WILDCARD_SERVER_ERROR",
                                safeName: "WILDCARD_SERVER_ERROR"
                            },
                            pascalCase: {
                                unsafeName: "WildcardServerError",
                                safeName: "WildcardServerError"
                            }
                        },
                        fernFilepath: {
                            allParts: [],
                            packagePath: [],
                            file: undefined
                        }
                    },
                    discriminantValue: {
                        name: {
                            originalName: "WildcardServerError",
                            camelCase: {
                                unsafeName: "wildcardServerError",
                                safeName: "wildcardServerError"
                            },
                            snakeCase: {
                                unsafeName: "wildcard_server_error",
                                safeName: "wildcard_server_error"
                            },
                            screamingSnakeCase: {
                                unsafeName: "WILDCARD_SERVER_ERROR",
                                safeName: "WILDCARD_SERVER_ERROR"
                            },
                            pascalCase: {
                                unsafeName: "WildcardServerError",
                                safeName: "WildcardServerError"
                            }
                        },
                        wireValue: "WildcardServerError"
                    },
                    statusCode: 500,
                    isWildcardStatusCode: true, // This should be filtered out
                    type: undefined,
                    displayName: undefined,
                    examples: [],
                    v2Examples: undefined,
                    headers: undefined,
                    docs: undefined
                }
            }
        };

        const migratedIR = V62_TO_V61_MIGRATION.migrateBackwards(v62IR as IrVersions.V62.IntermediateRepresentation, {
            taskContext: createMockTaskContext(),
            targetGenerator: {
                name: "test-generator",
                version: "0.0.0"
            }
        });

        // The wildcard error should be filtered out
        expect(migratedIR.errors).toHaveProperty("error_NotFoundError");
        expect(migratedIR.errors).not.toHaveProperty("error_WildcardServerError");
    });
});
