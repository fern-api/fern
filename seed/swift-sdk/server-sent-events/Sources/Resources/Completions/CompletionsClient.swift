import Foundation

public final class CompletionsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import ServerSentEvents
    ///
    /// private func main() async throws {
    ///     let client = ServerSentEventsClient()
    ///
    ///     _ = try await client.completions.stream(request: .init(query: "foo"))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func stream(request: Requests.StreamCompletionRequest, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ServerSentEvents
    ///
    /// private func main() async throws {
    ///     let client = ServerSentEventsClient()
    ///
    ///     _ = try await client.completions.streamWithoutTerminator(request: .init(query: "query"))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamWithoutTerminator(request: Requests.StreamCompletionRequestWithoutTerminator, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream-no-terminator",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }
}