import Foundation

public final class AdminClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func updatetestsubmissionstatus(submissionId: String, request: TestSubmissionStatus, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-submission-status/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func sendtestsubmissionupdate(submissionId: String, request: TestSubmissionUpdate, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-submission-status-v2/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func updateworkspacesubmissionstatus(submissionId: String, request: WorkspaceSubmissionStatus, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-submission-status/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func sendworkspacesubmissionupdate(submissionId: String, request: WorkspaceSubmissionUpdate, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-submission-status-v2/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storetracedtestcase(submissionId: String, testCaseId: String, request: Requests.AdminStoreTracedTestCaseRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-trace/submission/\(submissionId)/testCase/\(testCaseId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storetracedtestcasev2(submissionId: String, testCaseId: String, request: [TraceResponseV2], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-test-trace-v2/submission/\(submissionId)/testCase/\(testCaseId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storetracedworkspace(submissionId: String, request: Requests.AdminStoreTracedWorkspaceRequest, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-trace/submission/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }

    public func storetracedworkspacev2(submissionId: String, request: [TraceResponseV2], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/admin/store-workspace-trace-v2/submission/\(submissionId)",
            body: request,
            requestOptions: requestOptions
        )
    }
}