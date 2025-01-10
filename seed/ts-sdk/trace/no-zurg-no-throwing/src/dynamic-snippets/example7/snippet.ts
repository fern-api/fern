import { SeedTraceClient } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.admin.storeTracedWorkspace("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", {
        workspaceRunDetails: {
            exceptionV2: {
                type: "generic",
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace",
            },
            exception: {
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace",
            },
            stdout: "stdout",
        },
        traceResponses: [
            {
                submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                lineNumber: 1,
                returnValue: {
                    type: "integerValue",
                },
                expressionLocation: {
                    start: 1,
                    offset: 1,
                },
                stack: {
                    numStackFrames: 1,
                    topStackFrame: {
                        methodName: "methodName",
                        lineNumber: 1,
                        scopes: [
                            {
                                variables: {
                                    "variables": {
                                        type: "integerValue",
                                    },
                                },
                            },
                            {
                                variables: {
                                    "variables": {
                                        type: "integerValue",
                                    },
                                },
                            },
                        ],
                    },
                },
                stdout: "stdout",
            },
            {
                submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
                lineNumber: 1,
                returnValue: {
                    type: "integerValue",
                },
                expressionLocation: {
                    start: 1,
                    offset: 1,
                },
                stack: {
                    numStackFrames: 1,
                    topStackFrame: {
                        methodName: "methodName",
                        lineNumber: 1,
                        scopes: [
                            {
                                variables: {
                                    "variables": {
                                        type: "integerValue",
                                    },
                                },
                            },
                            {
                                variables: {
                                    "variables": {
                                        type: "integerValue",
                                    },
                                },
                            },
                        ],
                    },
                },
                stdout: "stdout",
            },
        ],
    });
}
main();
