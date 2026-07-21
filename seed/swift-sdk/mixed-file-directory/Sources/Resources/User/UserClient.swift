import Foundation

public final class UserClient: Sendable {
    public let events: EventsClient
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.events = EventsClient(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    /// List all users.
    ///
    /// ```swift
    /// import Foundation
    /// import MixedFileDirectory
    ///
    /// private func main() async throws {
    ///     let client = MixedFileDirectoryClient()
    ///
    ///     _ = try await client.user.list(limit: 1)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter limit: The maximum number of results to return.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func list(limit: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "limit": limit.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}