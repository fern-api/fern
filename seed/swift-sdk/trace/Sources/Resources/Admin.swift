public final class AdminClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func updateTestSubmissionStatus(submissionId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-test-submission-status/\(submissionId)", 
            requestOptions: requestOptions
        )
    }

    public func sendTestSubmissionUpdate(submissionId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-test-submission-status-v2/\(submissionId)", 
            requestOptions: requestOptions
        )
    }

    public func updateWorkspaceSubmissionStatus(submissionId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-workspace-submission-status/\(submissionId)", 
            requestOptions: requestOptions
        )
    }

    public func sendWorkspaceSubmissionUpdate(submissionId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-workspace-submission-status-v2/\(submissionId)", 
            requestOptions: requestOptions
        )
    }

    public func storeTracedTestCase(submissionId: String, testCaseId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-test-trace/submission/\(submissionId)/testCase/\(testCaseId)", 
            requestOptions: requestOptions
        )
    }

    public func storeTracedTestCaseV2(submissionId: String, testCaseId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-test-trace-v2/submission/\(submissionId)/testCase/\(testCaseId)", 
            requestOptions: requestOptions
        )
    }

    public func storeTracedWorkspace(submissionId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-workspace-trace/submission/\(submissionId)", 
            requestOptions: requestOptions
        )
    }

    public func storeTracedWorkspaceV2(submissionId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/admin/store-workspace-trace-v2/submission/\(submissionId)", 
            requestOptions: requestOptions
        )
    }
}