import { SeedTraceClient, SeedTrace } from "../..";

async function main() {
    const client = new SeedTraceClient({
        environment: "https://api.fern.com",
        token: "<token>",
    });
    await client.admin.storeTracedWorkspaceV2("d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32", [
        {
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            lineNumber: 1,
            file: {
                filename: "filename",
                directory: "directory",
            },
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
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            lineNumber: 1,
            file: {
                filename: "filename",
                directory: "directory",
            },
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
    ]);
}
main();
