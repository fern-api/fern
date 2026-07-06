import Foundation

public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import PaginationUriPath
    /// 
    /// private func main() async throws {
    ///     let client = PaginationUriPathClient(token: "<token>")
    /// 
    ///     _ = try await client.users.listWithUriPagination()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithUriPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersUriPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/uri",
            requestOptions: requestOptions,
            responseType: ListUsersUriPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import PaginationUriPath
    /// 
    /// private func main() async throws {
    ///     let client = PaginationUriPathClient(token: "<token>")
    /// 
    ///     _ = try await client.users.listWithPathPagination()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithPathPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPathPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/path",
            requestOptions: requestOptions,
            responseType: ListUsersPathPaginationResponse.self
        )
    }
}