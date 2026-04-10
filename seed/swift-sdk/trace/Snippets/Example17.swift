import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.storetracedworkspacev2(
        submissionId: "submissionId",
        request: .init(body: [
            TraceResponseV2(
                submissionId: "submissionId",
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
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
                                variables: [
                                    "variables": DebugVariableValue.debugVariableValueZero(
                                        DebugVariableValueZero(
                                            type: .integerValue
                                        )
                                    )
                                ]
                            ),
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.debugVariableValueZero(
                                        DebugVariableValueZero(
                                            type: .integerValue
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ),
                stdout: .value("stdout")
            ),
            TraceResponseV2(
                submissionId: "submissionId",
                lineNumber: 1,
                file: TracedFile(
                    filename: "filename",
                    directory: "directory"
                ),
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
                                variables: [
                                    "variables": DebugVariableValue.debugVariableValueZero(
                                        DebugVariableValueZero(
                                            type: .integerValue
                                        )
                                    )
                                ]
                            ),
                            Scope(
                                variables: [
                                    "variables": DebugVariableValue.debugVariableValueZero(
                                        DebugVariableValueZero(
                                            type: .integerValue
                                        )
                                    )
                                ]
                            )
                        ]
                    )
                ),
                stdout: .value("stdout")
            )
        ])
    )
}

try await main()
