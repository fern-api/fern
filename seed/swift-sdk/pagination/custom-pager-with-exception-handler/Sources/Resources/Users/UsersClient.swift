import Foundation

public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listwithcursorpagination(page: Nullable<Int>? = nil, perPage: Nullable<Int>? = nil, order: Order? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/cursor",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "per_page": perPage?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listwithmixedtypecursorpagination(cursor: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersMixedTypePaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users/mixed-type-cursor",
            queryParams: [
                "cursor": cursor?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersMixedTypePaginationResponse.self
        )
    }

    public func listwithbodycursorpagination(request: Requests.UsersListWithBodyCursorPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users/body-cursor",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    /// Pagination endpoint with a top-level cursor field in the request body.
    /// This tests that the mock server correctly ignores cursor mismatches
    /// when getNextPage() is called with a different cursor value.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func listwithtoplevelbodycursorpagination(request: Requests.UsersListWithTopLevelBodyCursorPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersTopLevelCursorPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users/top-level-cursor",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersTopLevelCursorPaginationResponse.self
        )
    }

    public func listwithoffsetpagination(page: Nullable<Int>? = nil, perPage: Nullable<Int>? = nil, order: Order? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/offset",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "per_page": perPage?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listwithdoubleoffsetpagination(page: Nullable<Double>? = nil, perPage: Nullable<Double>? = nil, order: Order? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/double-offset",
            queryParams: [
                "page": page?.wrappedValue.map { .double($0) }, 
                "per_page": perPage?.wrappedValue.map { .double($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listwithbodyoffsetpagination(request: Requests.UsersListWithBodyOffsetPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users/body-offset",
            body: request,
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listwithoffsetsteppagination(page: Nullable<Int>? = nil, limit: Nullable<Int>? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/offset-step",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "limit": limit?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listwithoffsetpaginationhasnextpage(page: Nullable<Int>? = nil, limit: Nullable<Int>? = nil, order: Order? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/offset-has-next-page",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "limit": limit?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersPaginationResponse.self
        )
    }

    public func listwithextendedresults(cursor: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/extended",
            queryParams: [
                "cursor": cursor?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersExtendedResponse.self
        )
    }

    public func listwithextendedresultsandoptionaldata(cursor: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersExtendedOptionalListResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/extended-optional",
            queryParams: [
                "cursor": cursor?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersExtendedOptionalListResponse.self
        )
    }

    public func listusernames(startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/usernames",
            queryParams: [
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameCursor.self
        )
    }

    public func listusernameswithoptionalresponse(startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/usernames-optional",
            queryParams: [
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameCursor.self
        )
    }

    public func listwithglobalconfig(offset: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameContainer {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/global-config",
            queryParams: [
                "offset": offset?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameContainer.self
        )
    }

    public func listwithoptionaldata(page: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersOptionalDataPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/optional-data",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersOptionalDataPaginationResponse.self
        )
    }

    public func listwithaliaseddata(page: Nullable<Int>? = nil, perPage: Nullable<Int>? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> ListUsersAliasedDataPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/aliased-data",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "per_page": perPage?.wrappedValue.map { .int($0) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: ListUsersAliasedDataPaginationResponse.self
        )
    }
}