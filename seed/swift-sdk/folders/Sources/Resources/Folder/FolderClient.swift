import Foundation

public final class FolderClient: Sendable {
    public let service: ServiceClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.service = ServiceClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.foo()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func foo(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            requestOptions: requestOptions
        )
    }
}