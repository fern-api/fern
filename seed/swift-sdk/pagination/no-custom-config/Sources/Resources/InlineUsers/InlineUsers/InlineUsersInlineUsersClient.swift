import Foundation

public final class InlineUsersInlineUsersClient: Sendable {
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
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
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
    public func listWithCursorPagination(page: Int? = nil, perPage: Int? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination(cursor: "cursor")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithMixedTypeCursorPagination(cursor: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersMixedTypePaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users",
            queryParams: [
                "cursor": cursor.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersMixedTypePaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithBodyCursorPagination(request: Requests.ListUsersBodyCursorPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
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
    public func listWithOffsetPagination(page: Int? = nil, perPage: Int? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
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
    public func listWithDoubleOffsetPagination(page: Double? = nil, perPage: Double? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .double($0) }, 
                "per_page": perPage.map { .double($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithMixedTypeCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithBodyOffsetPagination(request: Requests.ListUsersBodyOffsetPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
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
    public func listWithOffsetStepPagination(page: Int? = nil, limit: Int? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(
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
    public func listWithOffsetPaginationHasNextPage(page: Int? = nil, limit: Int? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithExtendedResults(cursor: UUID? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "cursor": cursor.map { .uuid($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersExtendedResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithExtendedResultsAndOptionalData(cursor: UUID? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedOptionalListResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "cursor": cursor.map { .uuid($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersExtendedOptionalListResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Pagination
    ///
    /// private func main() async throws {
    ///     let client = PaginationClient(token: "<token>")
    ///
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination(startingAfter: "starting_after")
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
            path: "/inline-users",
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
    ///     _ = try await client.inlineUsers.inlineUsers.listWithCursorPagination()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listWithGlobalConfig(offset: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameContainer {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "offset": offset.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameContainer.self
        )
    }
}