import Foundation

public final class AdminClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func updateTestSubmissionStatus(submissionId: String, request: TestSubmissionStatus, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-submission-status/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func sendTestSubmissionUpdate(submissionId: String, request: TestSubmissionUpdate, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-submission-status-v2/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func updateWorkspaceSubmissionStatus(submissionId: String, request: WorkspaceSubmissionStatus, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-submission-status/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func sendWorkspaceSubmissionUpdate(submissionId: String, request: WorkspaceSubmissionUpdate, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-submission-status-v2/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storeTracedTestCase(submissionId: String, testCaseId: String, request: StoreTracedTestCaseRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-trace/submission/\(submissionId)/testCase/\(testCaseId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storeTracedTestCaseV2(submissionId: String, testCaseId: String, request: [TraceResponseV2], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-trace-v2/submission/\(submissionId)/testCase/\(testCaseId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storeTracedWorkspace(submissionId: String, request: StoreTracedWorkspaceRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-trace/submission/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storeTracedWorkspaceV2(submissionId: String, request: [TraceResponseV2], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-trace-v2/submission/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }
}