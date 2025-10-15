import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.admin.storeTracedWorkspace(
        submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
        request: .init(
            workspaceRunDetails: WorkspaceRunDetails(
                exceptionV2: ExceptionV2.generic(
                    .init(
                        exceptionType: "exceptionType",
                        exceptionMessage: "exceptionMessage",
                        exceptionStacktrace: "exceptionStacktrace"
                    )
                ),
                exception: ExceptionInfo(
                    exceptionType: "exceptionType",
                    exceptionMessage: "exceptionMessage",
                    exceptionStacktrace: "exceptionStacktrace"
                ),
                stdout: "stdout"
            ),
            traceResponses: [
                TraceResponse(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
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
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
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
