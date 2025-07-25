public final class SubmissionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createExecutionSession(language: String, requestOptions: RequestOptions? = nil) async throws -> ExecutionSessionResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/sessions/create-session/\(language)",
            requestOptions: requestOptions,
            responseType: ExecutionSessionResponse.self
        )
    }

    public func getExecutionSession(sessionId: String, requestOptions: RequestOptions? = nil) async throws -> ExecutionSessionResponse? {
        return try await httpClient.performRequest(
            method: .get,
            path: "/sessions/\(sessionId)",
            requestOptions: requestOptions,
            responseType: ExecutionSessionResponse?.self
        )
    }

    public func stopExecutionSession(sessionId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/sessions/stop/\(sessionId)",
            requestOptions: requestOptions
        )
    }

    public func getExecutionSessionsState(requestOptions: RequestOptions? = nil) async throws -> GetExecutionSessionStateResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/sessions/execution-sessions-state",
            requestOptions: requestOptions,
            responseType: GetExecutionSessionStateResponse.self
        )
    }
}