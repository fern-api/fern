import Foundation

public final class HeadersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Enum
    /// 
    /// private func main() async throws {
    ///     let client = EnumClient()
    /// 
    ///     _ = try await client.headers.send()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func send(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/headers",
            requestOptions: requestOptions
        )
    }
}