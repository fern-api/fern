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
    ///     _ = try await client.users.listWithCursorPagination(
    ///         page: 1,
    ///         perPage: 1,
    ///         order: .asc,
    ///         startingAfter: "starting_after"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter page: Defaults to first page
    /// - Parameter perPage: Defaults to per page
    /// - Parameter startingAfter: The cursor used for pagination in order to fetch
    /// the next page of results.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithCursorPagination(page: Int? = nil, perPage: Int? = nil, order: OrderType? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithMixedTypeCursorPagination(cursor: "cursor")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithMixedTypeCursorPagination(cursor: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersMixedTypePaginationResponseType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            queryParams: [
                "cursor": cursor.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersMixedTypePaginationResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithMixedTypeCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithBodyCursorPagination(request: Requests.ListUsersBodyCursorPaginationRequestType, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    ///
    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithTopLevelBodyCursorPagination(request: .init(
    ///         cursor: "initial_cursor",
    ///         filter: "active"
    ///     ))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithTopLevelBodyCursorPagination(request: Requests.ListUsersTopLevelBodyCursorPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersTopLevelCursorPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users/top-level-cursor",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersTopLevelCursorPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination(
    ///         page: 1,
    ///         perPage: 1,
    ///         order: .asc,
    ///         startingAfter: "starting_after"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter page: Defaults to first page
    /// - Parameter perPage: Defaults to per page
    /// - Parameter startingAfter: The cursor used for pagination in order to fetch
    /// the next page of results.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithOffsetPagination(page: Int? = nil, perPage: Int? = nil, order: OrderType? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination(
    ///         page: 1.1,
    ///         perPage: 1.1,
    ///         order: .asc,
    ///         startingAfter: "starting_after"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter page: Defaults to first page
    /// - Parameter perPage: Defaults to per page
    /// - Parameter startingAfter: The cursor used for pagination in order to fetch
    /// the next page of results.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithDoubleOffsetPagination(page: Double? = nil, perPage: Double? = nil, order: OrderType? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .double($0) }, 
                "per_page": perPage.map { .double($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithMixedTypeCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithBodyOffsetPagination(request: Requests.ListUsersBodyOffsetPaginationRequestType, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination(
    ///         page: 1,
    ///         order: .asc
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter page: Defaults to first page
    /// - Parameter limit: The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithOffsetStepPagination(page: Int? = nil, limit: Int? = nil, order: OrderType? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination(
    ///         page: 1,
    ///         order: .asc
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter page: Defaults to first page
    /// - Parameter limit: The maximum number of elements to return.
    /// This is also used as the step size in this
    /// paginated endpoint.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithOffsetPaginationHasNextPage(page: Int? = nil, limit: Int? = nil, order: OrderType? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithExtendedResults(cursor: UUID? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "cursor": cursor.map { .uuid($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersExtendedResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithExtendedResultsAndOptionalData(cursor: UUID? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedOptionalListResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "cursor": cursor.map { .uuid($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersExtendedOptionalListResponseType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination(startingAfter: "starting_after")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter startingAfter: The cursor used for pagination in order to fetch
    /// the next page of results.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listUsernames(startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameCursor.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination(startingAfter: "starting_after")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter startingAfter: The cursor used for pagination in order to fetch
    /// the next page of results.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listUsernamesWithOptionalResponse(startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameCursor? {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameCursor?.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithGlobalConfig(offset: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameContainerType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "offset": offset.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameContainerType.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithOptionalData(page: 1)
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter page: Defaults to first page
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithOptionalData(page: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersOptionalDataPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/optional-data",
            queryParams: [
                "page": page.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersOptionalDataPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.users.listWithAliasedData(
    ///         page: 1,
    ///         perPage: 1,
    ///         startingAfter: "starting_after"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter page: Defaults to first page
    /// - Parameter perPage: Defaults to per page
    /// - Parameter startingAfter: The cursor used for pagination in order to fetch
    /// the next page of results.
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithAliasedData(page: Int? = nil, perPage: Int? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersAliasedDataPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/aliased-data",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersAliasedDataPaginationResponse.self
        )
    }
}