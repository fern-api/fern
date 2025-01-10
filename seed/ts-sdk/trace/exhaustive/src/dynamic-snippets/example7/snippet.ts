import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.admin.storeTracedWorkspace(SeedTrace.submission.SubmissionId("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"), {
        workspaceRunDetails: {
            exceptionV2: SeedTrace.submission.ExceptionV2.generic({
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace",
            }),
            exception: {
                exceptionType: "exceptionType",
                exceptionMessage: "exceptionMessage",
                exceptionStacktrace: "exceptionStacktrace",
            },
            stdout: "stdout",
        },
        traceResponses: [
            {
                submissionId: SeedTrace.submission.SubmissionId("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                lineNumber: 1,
                returnValue: SeedTrace.commons.DebugVariableValue.integerValue({}),
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
                                    variables: SeedTrace.commons.DebugVariableValue.integerValue({}),
                                },
                            },
                            {
                                variables: {
                                    variables: SeedTrace.commons.DebugVariableValue.integerValue({}),
                                },
                            },
                        ],
                    },
                },
                stdout: "stdout",
            },
            {
                submissionId: SeedTrace.submission.SubmissionId("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                lineNumber: 1,
                returnValue: SeedTrace.commons.DebugVariableValue.integerValue({}),
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
                                    variables: SeedTrace.commons.DebugVariableValue.integerValue({}),
                                },
                            },
                            {
                                variables: {
                                    variables: SeedTrace.commons.DebugVariableValue.integerValue({}),
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
