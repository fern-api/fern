import Foundation

public final class PaginationClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// List items with cursor pagination
    ///
    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.pagination.listItems(
    ///         cursor: "cursor",
    ///         limit: 1
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter cursor: The cursor for pagination
    /// - Parameter limit: Maximum number of items to return
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listItems(cursor: String? = nil, limit: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> PaginatedResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/pagination",
            queryParams: [
                "cursor": cursor.map { .string($0) }, 
                "limit": limit.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: PaginatedResponse.self
        )
    }
}