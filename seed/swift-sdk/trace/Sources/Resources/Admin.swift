public final class AdminClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func updateTestSubmissionStatus(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func sendTestSubmissionUpdate(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func updateWorkspaceSubmissionStatus(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func sendWorkspaceSubmissionUpdate(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func storeTracedTestCase(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func storeTracedTestCaseV2(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func storeTracedWorkspace(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func storeTracedWorkspaceV2(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }
}