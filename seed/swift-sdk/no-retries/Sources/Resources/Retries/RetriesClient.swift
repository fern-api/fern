import Foundation

public final class RetriesClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import NoRetries
    ///
    /// private func main() async throws {
    ///     let client = NoRetriesClient()
    ///
    ///     _ = try await client.retries.getUsers()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getUsers(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            retriesDisabled: true,
            responseType: [User].self
        )
    }
}