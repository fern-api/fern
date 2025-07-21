public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listWithCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithMixedTypeCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersMixedTypePaginationResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithBodyCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithDoubleOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithBodyOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithOffsetStepPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithOffsetPaginationHasNextPage(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithExtendedResults(requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithExtendedResultsAndOptionalData(requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedOptionalListResponse {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listUsernames(requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }

    public func listWithGlobalConfig(requestOptions: RequestOptions? = nil) async throws -> UsernameContainer {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/users", 
            requestOptions: requestOptions
        )
    }
}