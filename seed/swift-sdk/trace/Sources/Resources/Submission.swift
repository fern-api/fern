public final class SubmissionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createExecutionSession(requestOptions: RequestOptions? = nil) throws -> ExecutionSessionResponse {
    }

    public func getExecutionSession(requestOptions: RequestOptions? = nil) throws -> ExecutionSessionResponse {
    }

    public func stopExecutionSession(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func getExecutionSessionsState(requestOptions: RequestOptions? = nil) throws -> GetExecutionSessionStateResponse {
    }
}