import Foundation

public final class V1Client: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient(
    ///         token: "<token>",
    ///         apiKey: "<X-Api-Key>"
    ///     )
    ///
    ///     _ = try await client.v1.listUsers()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listUsers(requestOptions: RequestOptions? = nil) async throws -> [UserV1] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [UserV1].self
        )
    }
}