import Foundation

public final class PathClient: Sendable {
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
    ///     _ = try await client.path.send(id: "123")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func send(id: String, requestOptions: RequestOptions? = nil) async throws -> SendResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/path/\(id)",
            requestOptions: requestOptions,
            responseType: SendResponse.self
        )
    }
}