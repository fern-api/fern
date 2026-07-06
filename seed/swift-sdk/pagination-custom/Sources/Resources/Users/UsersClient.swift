import Foundation

public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    /// 
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    /// 
    ///     _ = try await client.users.listWithCustomPager(
    ///         limit: 1,
    ///         startingAfter: "starting_after"
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter limit: The maximum number of results to return.
    /// - Parameter startingAfter: The cursor used for pagination.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithCustomPager(limit: Int? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> UsersListResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "limit": limit.map { .int($0) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsersListResponse.self
        )
    }
}