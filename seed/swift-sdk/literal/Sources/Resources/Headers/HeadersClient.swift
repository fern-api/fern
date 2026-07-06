import Foundation

public final class HeadersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Literal
    /// 
    /// private func main() async throws {
    ///     let client = LiteralClient()
    /// 
    ///     _ = try await client.headers.send(request: .init(query: "What is the weather today"))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func send(request: Requests.SendLiteralsInHeadersRequest, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/headers",
            body: request,
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}