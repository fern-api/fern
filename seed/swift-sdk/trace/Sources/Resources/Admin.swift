public final class AdminClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func updateTestSubmissionStatus(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func sendTestSubmissionUpdate(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func updateWorkspaceSubmissionStatus(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func sendWorkspaceSubmissionUpdate(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func storeTracedTestCase(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func storeTracedTestCaseV2(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func storeTracedWorkspace(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func storeTracedWorkspaceV2(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}