import Foundation

public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listWithCursorPagination(page: Int? = nil, perPage: Int? = nil, order: OrderType? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

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

    public func listWithBodyCursorPagination(request: Requests.ListUsersBodyCursorPaginationRequestType, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    public func listWithOffsetPagination(page: Int? = nil, perPage: Int? = nil, order: OrderType? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    public func listWithDoubleOffsetPagination(page: Double? = nil, perPage: Double? = nil, order: OrderType? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .double($0) }, 
                "per_page": perPage.map { .double($0) }, 
                "order": order.map { .unknown($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    public func listWithBodyOffsetPagination(request: Requests.ListUsersBodyOffsetPaginationRequestType, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    public func listWithOffsetStepPagination(page: Int? = nil, limit: Int? = nil, order: OrderType? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

    public func listWithOffsetPaginationHasNextPage(page: Int? = nil, limit: Int? = nil, order: OrderType? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponseType {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponseType.self
        )
    }

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
}