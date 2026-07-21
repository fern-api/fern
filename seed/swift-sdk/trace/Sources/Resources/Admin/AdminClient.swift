import Foundation

public final class AdminClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.updateTestSubmissionStatus(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         request: TestSubmissionStatus.stopped
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateTestSubmissionStatus(submissionId: String, request: TestSubmissionStatus, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-submission-status/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.sendTestSubmissionUpdate(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         request: TestSubmissionUpdate(
    ///             updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///             updateInfo: TestSubmissionUpdateInfo.running(
    ///                 .queueingSubmission
    ///             )
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func sendTestSubmissionUpdate(submissionId: String, request: TestSubmissionUpdate, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-submission-status-v2/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.updateWorkspaceSubmissionStatus(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         request: WorkspaceSubmissionStatus.stopped
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateWorkspaceSubmissionStatus(submissionId: String, request: WorkspaceSubmissionStatus, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-submission-status/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.sendWorkspaceSubmissionUpdate(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         request: WorkspaceSubmissionUpdate(
    ///             updateTime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
    ///             updateInfo: WorkspaceSubmissionUpdateInfo.running(
    ///                 .queueingSubmission
    ///             )
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func sendWorkspaceSubmissionUpdate(submissionId: String, request: WorkspaceSubmissionUpdate, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-submission-status-v2/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.storeTracedTestCase(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         testCaseId: "testCaseId",
    ///         request: .init(
    ///             result: TestCaseResultWithStdout(
    ///                 result: TestCaseResult(
    ///                     expectedResult: VariableValue.integerValue(
    ///                         1
    ///                     ),
    ///                     actualResult: ActualResult.value(
    ///                         VariableValue.integerValue(
    ///                             1
    ///                         )
    ///                     ),
    ///                     passed: true
    ///                 ),
    ///                 stdout: "stdout"
    ///             ),
    ///             traceResponses: [
    ///                 TraceResponse(
    ///                     submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                     lineNumber: 1,
    ///                     returnValue: DebugVariableValue.integerValue(
    ///                         1
    ///                     ),
    ///                     expressionLocation: ExpressionLocation(
    ///                         start: 1,
    ///                         offset: 1
    ///                     ),
    ///                     stack: StackInformation(
    ///                         numStackFrames: 1,
    ///                         topStackFrame: StackFrame(
    ///                             methodName: "methodName",
    ///                             lineNumber: 1,
    ///                             scopes: [
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 ),
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 )
    ///                             ]
    ///                         )
    ///                     ),
    ///                     stdout: "stdout"
    ///                 ),
    ///                 TraceResponse(
    ///                     submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                     lineNumber: 1,
    ///                     returnValue: DebugVariableValue.integerValue(
    ///                         1
    ///                     ),
    ///                     expressionLocation: ExpressionLocation(
    ///                         start: 1,
    ///                         offset: 1
    ///                     ),
    ///                     stack: StackInformation(
    ///                         numStackFrames: 1,
    ///                         topStackFrame: StackFrame(
    ///                             methodName: "methodName",
    ///                             lineNumber: 1,
    ///                             scopes: [
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 ),
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 )
    ///                             ]
    ///                         )
    ///                     ),
    ///                     stdout: "stdout"
    ///                 )
    ///             ]
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func storeTracedTestCase(submissionId: String, testCaseId: String, request: Requests.StoreTracedTestCaseRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-trace/submission/\(submissionId)/testCase/\(testCaseId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.storeTracedTestCaseV2(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         testCaseId: "testCaseId",
    ///         request: [
    ///             TraceResponseV2(
    ///                 submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                 lineNumber: 1,
    ///                 file: TracedFile(
    ///                     filename: "filename",
    ///                     directory: "directory"
    ///                 ),
    ///                 returnValue: DebugVariableValue.integerValue(
    ///                     1
    ///                 ),
    ///                 expressionLocation: ExpressionLocation(
    ///                     start: 1,
    ///                     offset: 1
    ///                 ),
    ///                 stack: StackInformation(
    ///                     numStackFrames: 1,
    ///                     topStackFrame: StackFrame(
    ///                         methodName: "methodName",
    ///                         lineNumber: 1,
    ///                         scopes: [
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             ),
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             )
    ///                         ]
    ///                     )
    ///                 ),
    ///                 stdout: "stdout"
    ///             ),
    ///             TraceResponseV2(
    ///                 submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                 lineNumber: 1,
    ///                 file: TracedFile(
    ///                     filename: "filename",
    ///                     directory: "directory"
    ///                 ),
    ///                 returnValue: DebugVariableValue.integerValue(
    ///                     1
    ///                 ),
    ///                 expressionLocation: ExpressionLocation(
    ///                     start: 1,
    ///                     offset: 1
    ///                 ),
    ///                 stack: StackInformation(
    ///                     numStackFrames: 1,
    ///                     topStackFrame: StackFrame(
    ///                         methodName: "methodName",
    ///                         lineNumber: 1,
    ///                         scopes: [
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             ),
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             )
    ///                         ]
    ///                     )
    ///                 ),
    ///                 stdout: "stdout"
    ///             )
    ///         ]
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func storeTracedTestCaseV2(submissionId: String, testCaseId: String, request: [TraceResponseV2], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-trace-v2/submission/\(submissionId)/testCase/\(testCaseId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.storeTracedWorkspace(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         request: .init(
    ///             workspaceRunDetails: WorkspaceRunDetails(
    ///                 exceptionV2: ExceptionV2.generic(
    ///                     ExceptionInfo(
    ///                         exceptionType: "exceptionType",
    ///                         exceptionMessage: "exceptionMessage",
    ///                         exceptionStacktrace: "exceptionStacktrace"
    ///                     )
    ///                 ),
    ///                 exception: ExceptionInfo(
    ///                     exceptionType: "exceptionType",
    ///                     exceptionMessage: "exceptionMessage",
    ///                     exceptionStacktrace: "exceptionStacktrace"
    ///                 ),
    ///                 stdout: "stdout"
    ///             ),
    ///             traceResponses: [
    ///                 TraceResponse(
    ///                     submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                     lineNumber: 1,
    ///                     returnValue: DebugVariableValue.integerValue(
    ///                         1
    ///                     ),
    ///                     expressionLocation: ExpressionLocation(
    ///                         start: 1,
    ///                         offset: 1
    ///                     ),
    ///                     stack: StackInformation(
    ///                         numStackFrames: 1,
    ///                         topStackFrame: StackFrame(
    ///                             methodName: "methodName",
    ///                             lineNumber: 1,
    ///                             scopes: [
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 ),
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 )
    ///                             ]
    ///                         )
    ///                     ),
    ///                     stdout: "stdout"
    ///                 ),
    ///                 TraceResponse(
    ///                     submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                     lineNumber: 1,
    ///                     returnValue: DebugVariableValue.integerValue(
    ///                         1
    ///                     ),
    ///                     expressionLocation: ExpressionLocation(
    ///                         start: 1,
    ///                         offset: 1
    ///                     ),
    ///                     stack: StackInformation(
    ///                         numStackFrames: 1,
    ///                         topStackFrame: StackFrame(
    ///                             methodName: "methodName",
    ///                             lineNumber: 1,
    ///                             scopes: [
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 ),
    ///                                 Scope(
    ///                                     variables: [
    ///                                         "variables": DebugVariableValue.integerValue(
    ///                                             1
    ///                                         )
    ///                                     ]
    ///                                 )
    ///                             ]
    ///                         )
    ///                     ),
    ///                     stdout: "stdout"
    ///                 )
    ///             ]
    ///         )
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func storeTracedWorkspace(submissionId: String, request: Requests.StoreTracedWorkspaceRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-trace/submission/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.admin.storeTracedWorkspaceV2(
    ///         submissionId: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
    ///         request: [
    ///             TraceResponseV2(
    ///                 submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                 lineNumber: 1,
    ///                 file: TracedFile(
    ///                     filename: "filename",
    ///                     directory: "directory"
    ///                 ),
    ///                 returnValue: DebugVariableValue.integerValue(
    ///                     1
    ///                 ),
    ///                 expressionLocation: ExpressionLocation(
    ///                     start: 1,
    ///                     offset: 1
    ///                 ),
    ///                 stack: StackInformation(
    ///                     numStackFrames: 1,
    ///                     topStackFrame: StackFrame(
    ///                         methodName: "methodName",
    ///                         lineNumber: 1,
    ///                         scopes: [
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             ),
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             )
    ///                         ]
    ///                     )
    ///                 ),
    ///                 stdout: "stdout"
    ///             ),
    ///             TraceResponseV2(
    ///                 submissionId: UUID(uuidString: "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32")!,
    ///                 lineNumber: 1,
    ///                 file: TracedFile(
    ///                     filename: "filename",
    ///                     directory: "directory"
    ///                 ),
    ///                 returnValue: DebugVariableValue.integerValue(
    ///                     1
    ///                 ),
    ///                 expressionLocation: ExpressionLocation(
    ///                     start: 1,
    ///                     offset: 1
    ///                 ),
    ///                 stack: StackInformation(
    ///                     numStackFrames: 1,
    ///                     topStackFrame: StackFrame(
    ///                         methodName: "methodName",
    ///                         lineNumber: 1,
    ///                         scopes: [
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             ),
    ///                             Scope(
    ///                                 variables: [
    ///                                     "variables": DebugVariableValue.integerValue(
    ///                                         1
    ///                                     )
    ///                                 ]
    ///                             )
    ///                         ]
    ///                     )
    ///                 ),
    ///                 stdout: "stdout"
    ///             )
    ///         ]
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func storeTracedWorkspaceV2(submissionId: String, request: [TraceResponseV2], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-trace-v2/submission/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }
}