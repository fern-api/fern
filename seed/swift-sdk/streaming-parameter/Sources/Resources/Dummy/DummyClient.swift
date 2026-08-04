import Foundation

public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Streaming
    ///
    /// private func main() async throws {
    ///     let client = StreamingClient()
    ///
    ///     _ = try await client.dummy.generate(request: .init(
    ///         stream: false,
    ///         numEvents: 5
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func generate(request: Requests.GenerateRequest, requestOptions: RequestOptions? = nil) async throws -> RegularResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/generate",
            body: request,
            requestOptions: requestOptions,
            responseType: RegularResponse.self
        )
    }
}