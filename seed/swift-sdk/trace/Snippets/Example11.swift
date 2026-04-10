import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.storetracedtestcase(
        submissionId: "submissionId",
        testCaseId: "testCaseId",
        request: .init(
            result: TestCaseResultWithStdout(
                result: TestCaseResult(
                    expectedResult: VariableValue.variableValueZero(
                        VariableValueZero(
                            type: .integerValue,
                            value: 1
                        )
                    ),
                    actualResult: ActualResult.actualResultZero(
                        ActualResultZero(
                            type: .value,
                            value: VariableValue.variableValueZero(
                                VariableValueZero(
                                    type: .integerValue,
                                    value: 1
                                )
                            )
                        )
                    ),
                    passed: true
                ),
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: "submissionId",
                    lineNumber: 1,
                    returnValue: DebugVariableValue.debugVariableValueZero(
                        DebugVariableValueZero(
                            type: .integerValue,
                            value: 1
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
                                    variables: [:]
                                ),
                                Scope(
                                    variables: [:]
                                )
                            ]
                        )
                    ),
                    stdout: .value("stdout")
                ),
                TraceResponse(
                    submissionId: "submissionId",
                    lineNumber: 1,
                    returnValue: DebugVariableValue.debugVariableValueZero(
                        DebugVariableValueZero(
                            type: .integerValue,
                            value: 1
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
                                    variables: [:]
                                ),
                                Scope(
                                    variables: [:]
                                )
                            ]
                        )
                    ),
                    stdout: .value("stdout")
                )
            ]
        )
    )
}

try await main()
