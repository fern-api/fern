import Foundation

public final class InlineUsersInlineUsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listWithCursorPagination(page: Int? = nil, perPage: Int? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

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

    public func listWithBodyCursorPagination(request: Requests.ListUsersBodyCursorPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listWithOffsetPagination(page: Int? = nil, perPage: Int? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "per_page": perPage.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listWithDoubleOffsetPagination(page: Double? = nil, perPage: Double? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .double($0) }, 
                "per_page": perPage.map { .double($0) }, 
                "order": order.map { .unknown($0.rawValue) }, 
                "starting_after": startingAfter.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listWithBodyOffsetPagination(request: Requests.ListUsersBodyOffsetPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listWithOffsetStepPagination(page: Int? = nil, limit: Int? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listWithOffsetPaginationHasNextPage(page: Int? = nil, limit: Int? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users",
            queryParams: [
                "page": page.map { .int($0) }, 
                "limit": limit.map { .int($0) }, 
                "order": order.map { .unknown($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

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