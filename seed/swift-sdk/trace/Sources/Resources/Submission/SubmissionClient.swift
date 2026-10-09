import Foundation

public final class SubmissionClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Returns sessionId and execution server URL for session. Spins up server.
    ///
    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.submission.createExecutionSession(language: "JAVA")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createExecutionSession(language: String, requestOptions: RequestOptions? = nil) async throws -> ExecutionSessionResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/sessions/create-session/\(language)",
            requestOptions: requestOptions,
            responseType: ExecutionSessionResponse.self
        )
    }

    /// Returns execution server URL for session. Returns empty if session isn't registered.
    ///
    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.submission.getExecutionSession(sessionId: "sessionId")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getExecutionSession(sessionId: String, requestOptions: RequestOptions? = nil) async throws -> ExecutionSessionResponse? {
        return try await httpClient.performRequest(
            method: .get,
            path: "/sessions/\(sessionId)",
            requestOptions: requestOptions,
            responseType: ExecutionSessionResponse?.self
        )
    }

    /// Stops execution session.
    ///
    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.submission.stopExecutionSession(sessionId: "sessionId")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func stopExecutionSession(sessionId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/sessions/stop/\(sessionId)",
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
    ///     _ = try await client.submission.getExecutionSessionsState()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getExecutionSessionsState(requestOptions: RequestOptions? = nil) async throws -> GetExecutionSessionStateResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/sessions/execution-sessions-state",
            requestOptions: requestOptions,
            responseType: GetExecutionSessionStateResponse.self
        )
    }
}