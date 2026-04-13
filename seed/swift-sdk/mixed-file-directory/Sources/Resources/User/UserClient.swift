import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// List all users.
    ///
    /// - Parameter limit: The maximum number of results to return.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func list(limit: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "limit": limit?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}