public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listWithCursorPagination(requestOptions: RequestOptions? = nil) throws -> ListUsersPaginationResponse {
    }

    public func listWithMixedTypeCursorPagination(requestOptions: RequestOptions? = nil) throws -> ListUsersMixedTypePaginationResponse {
    }

    public func listWithBodyCursorPagination(requestOptions: RequestOptions? = nil) throws -> ListUsersPaginationResponse {
    }

    public func listWithOffsetPagination(requestOptions: RequestOptions? = nil) throws -> ListUsersPaginationResponse {
    }

    public func listWithDoubleOffsetPagination(requestOptions: RequestOptions? = nil) throws -> ListUsersPaginationResponse {
    }

    public func listWithBodyOffsetPagination(requestOptions: RequestOptions? = nil) throws -> ListUsersPaginationResponse {
    }

    public func listWithOffsetStepPagination(requestOptions: RequestOptions? = nil) throws -> ListUsersPaginationResponse {
    }

    public func listWithOffsetPaginationHasNextPage(requestOptions: RequestOptions? = nil) throws -> ListUsersPaginationResponse {
    }

    public func listWithExtendedResults(requestOptions: RequestOptions? = nil) throws -> ListUsersExtendedResponse {
    }

    public func listWithExtendedResultsAndOptionalData(requestOptions: RequestOptions? = nil) throws -> ListUsersExtendedOptionalListResponse {
    }

    public func listUsernames(requestOptions: RequestOptions? = nil) throws -> UsernameCursor {
    }

    public func listWithGlobalConfig(requestOptions: RequestOptions? = nil) throws -> UsernameContainer {
    }
}