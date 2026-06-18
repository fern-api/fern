import Foundation
import Trace

enum Example5 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.admin.storeTracedTestCase(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            testCaseId: "testCaseId",
            request: .init(
                result: TestCaseResultWithStdout(
                    result: TestCaseResult(
                        expectedResult: VariableValue.integerValue(
                            1
                        ),
                        actualResult: ActualResult.value(
                            VariableValue.integerValue(
                                1
                            )
                        ),
                        passed: true
                    ),
                    stdout: "stdout"
                ),
                traceResponses: [
                    TraceResponse(
                        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                        lineNumber: 1,
                        returnValue: DebugVariableValue.integerValue(
                            1
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
                                                1
                                            )
                                        ]
                                    ),
                                    Scope(
                                        variables: [
                                            "variables": DebugVariableValue.integerValue(
                                                1
                                            )
                                        ]
                                    )
                                ]
                            )
                        ),
                        stdout: "stdout"
                    ),
                    TraceResponse(
                        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                        lineNumber: 1,
                        returnValue: DebugVariableValue.integerValue(
                            1
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
                                                1
                                            )
                                        ]
                                    ),
                                    Scope(
                                        variables: [
                                            "variables": DebugVariableValue.integerValue(
                                                1
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
}
