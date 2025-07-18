public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listWithCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
    }

    public func listWithMixedTypeCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersMixedTypePaginationResponse {
    }

    public func listWithBodyCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
    }

    public func listWithOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
    }

    public func listWithDoubleOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
    }

    public func listWithBodyOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
    }

    public func listWithOffsetStepPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
    }

    public func listWithOffsetPaginationHasNextPage(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
    }

    public func listWithExtendedResults(requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedResponse {
    }

    public func listWithExtendedResultsAndOptionalData(requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedOptionalListResponse {
    }

    public func listUsernames(requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
    }

    public func listWithGlobalConfig(requestOptions: RequestOptions? = nil) async throws -> UsernameContainer {
    }
}