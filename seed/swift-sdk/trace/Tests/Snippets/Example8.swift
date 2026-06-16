import Foundation
import Trace

enum Example8 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.admin.storeTracedWorkspaceV2(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: [
                TraceResponseV2(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    lineNumber: 1,
                    file: TracedFile(
                        filename: "filename",
                        directory: "directory"
                    ),
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
                TraceResponseV2(
                    submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
                    lineNumber: 1,
                    file: TracedFile(
                        filename: "filename",
                        directory: "directory"
                    ),
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
    }
}
