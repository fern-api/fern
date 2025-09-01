import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.admin.storeTracedTestCase(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
        testCaseId: "testCaseId",
        request: .init(
            submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
            testCaseId: "testCaseId",
            result: TestCaseResultWithStdout(
                result: TestCaseResult(
                    expectedResult: VariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    actualResult: ActualResult.value(
                        .init(
                            value: VariableValue.integerValue(
                                .init(
                                    integerValue: 
                                )
                            )
                        )
                    ),
                    passed: True
                ),
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    lineNumber: 1,
                    returnValue: DebugVariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    expressionLocation: ExpressionLocation(
                        start: 1,
                        offset: 1
                    ),
                    stack: StackInformation(
                        numStackFrames: 1,
                        topStackFrame: StackFrame(
                            methodName: "methodName",
                            lineNumber: 1,
                            scopes: [
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                ),
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                )
                            ]
                        )
                    ),
                    stdout: "stdout"
                ),
                TraceResponse(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"),
                    lineNumber: 1,
                    returnValue: DebugVariableValue.integerValue(
                        .init(
                            integerValue: 
                        )
                    ),
                    expressionLocation: ExpressionLocation(
                        start: 1,
                        offset: 1
                    ),
                    stack: StackInformation(
                        numStackFrames: 1,
                        topStackFrame: StackFrame(
                            methodName: "methodName",
                            lineNumber: 1,
                            scopes: [
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                ),
                                Scope(
                                    variables: [
                                        "variables": DebugVariableValue.integerValue(
                                            .init(
                                                integerValue: 
                                            )
                                        )
                                    ]
                                )
                            ]
                        )
                    ),
                    stdout: "stdout"
                )
            ]
        )
    )
}

try await main()
