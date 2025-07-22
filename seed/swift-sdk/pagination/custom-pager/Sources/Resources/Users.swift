public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listWithCursorPagination(page: Int? = nil, perPage: Int? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "page": page.map { .string($0) }, 
                "per_page": perPage.map { .string($0) }, 
                "order": order.map { .string($0) }, 
                "starting_after": startingAfter.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithMixedTypeCursorPagination(cursor: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersMixedTypePaginationResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/users", 
            queryParams: [
                "cursor": cursor.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithBodyCursorPagination(request: Any, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/users", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func listWithOffsetPagination(page: Int? = nil, perPage: Int? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "page": page.map { .string($0) }, 
                "per_page": perPage.map { .string($0) }, 
                "order": order.map { .string($0) }, 
                "starting_after": startingAfter.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithDoubleOffsetPagination(page: Double? = nil, perPage: Double? = nil, order: Order? = nil, startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "page": page.map { .string($0) }, 
                "per_page": perPage.map { .string($0) }, 
                "order": order.map { .string($0) }, 
                "starting_after": startingAfter.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithBodyOffsetPagination(request: Any, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/users", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func listWithOffsetStepPagination(page: Int? = nil, limit: Int? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "page": page.map { .string($0) }, 
                "limit": limit.map { .string($0) }, 
                "order": order.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithOffsetPaginationHasNextPage(page: Int? = nil, limit: Int? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "page": page.map { .string($0) }, 
                "limit": limit.map { .string($0) }, 
                "order": order.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithExtendedResults(cursor: UUID? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "cursor": cursor.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithExtendedResultsAndOptionalData(cursor: UUID? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedOptionalListResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "cursor": cursor.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listUsernames(startingAfter: String? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "starting_after": startingAfter.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }

    public func listWithGlobalConfig(offset: Int? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameContainer {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            queryParams: [
                "offset": offset.map { .string($0) }
            ], 
            requestOptions: requestOptions
        )
    }
}