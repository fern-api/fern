import Foundation
import Testing
import Trace

@Suite("AdminClient Wire Tests") struct AdminClientWireTests {
    @Test func updateTestSubmissionStatus1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.updateTestSubmissionStatus(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: TestSubmissionStatus.stopped,
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func sendTestSubmissionUpdate1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.sendTestSubmissionUpdate(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: TestSubmissionUpdate(
                updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updateInfo: TestSubmissionUpdateInfo.running(
                    .queueingSubmission
                )
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func updateWorkspaceSubmissionStatus1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.updateWorkspaceSubmissionStatus(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: WorkspaceSubmissionStatus.stopped,
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func sendWorkspaceSubmissionUpdate1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.sendWorkspaceSubmissionUpdate(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: WorkspaceSubmissionUpdate(
                updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
                updateInfo: WorkspaceSubmissionUpdateInfo.running(
                    .queueingSubmission
                )
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func storeTracedTestCase1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.storeTracedTestCase(
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
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func storeTracedTestCaseV21() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.storeTracedTestCaseV2(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            testCaseId: "testCaseId",
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
            ],
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func storeTracedWorkspace1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.storeTracedWorkspace(
            submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            request: .init(
                workspaceRunDetails: WorkspaceRunDetails(
                    exceptionV2: ExceptionV2.generic(
                        ExceptionInfo(
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
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }

    @Test func storeTracedWorkspaceV21() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.admin.storeTracedWorkspaceV2(
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
            ],
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}