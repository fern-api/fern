import Foundation

public final class CompletionsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import ServerSentEventsResumable
    /// 
    /// private func main() async throws {
    ///     let client = ServerSentEventsResumableClient()
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
    /// import ServerSentEventsResumable
    /// 
    /// private func main() async throws {
    ///     let client = ServerSentEventsResumableClient()
    /// 
    ///     _ = try await client.completions.streamNonResumable(request: .init(query: "bar"))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func streamNonResumable(request: Requests.StreamCompletionRequestNonResumable, requestOptions: RequestOptions? = nil) async throws -> JSONValue {
        return try await httpClient.performRequest(
            method: .post,
            path: "/stream-non-resumable",
            body: request,
            requestOptions: requestOptions,
            responseType: JSONValue.self
        )
    }
}