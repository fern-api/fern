public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listWithCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithMixedTypeCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersMixedTypePaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithBodyCursorPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithDoubleOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithBodyOffsetPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithOffsetStepPagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithOffsetPaginationHasNextPage(requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        fatalError("Not implemented.")
    }

    public func listWithExtendedResults(requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedResponse {
        fatalError("Not implemented.")
    }

    public func listWithExtendedResultsAndOptionalData(requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedOptionalListResponse {
        fatalError("Not implemented.")
    }

    public func listUsernames(requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        fatalError("Not implemented.")
    }

    public func listWithGlobalConfig(requestOptions: RequestOptions? = nil) async throws -> UsernameContainer {
        fatalError("Not implemented.")
    }
}