import Foundation

public final class InlineUsersInlineUsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func inlineUsersInlineUsersListWithCursorPagination(page: Nullable<Int>? = nil, perPage: Nullable<Int>? = nil, order: InlineUsersOrder? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/cursor",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "per_page": perPage?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersPaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithMixedTypeCursorPagination(cursor: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersMixedTypePaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users/mixed-type-cursor",
            queryParams: [
                "cursor": cursor?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersMixedTypePaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithBodyCursorPagination(request: Requests.InlineUsersInlineUsersListWithBodyCursorPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users/body-cursor",
            body: request,
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersPaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithOffsetPagination(page: Nullable<Int>? = nil, perPage: Nullable<Int>? = nil, order: InlineUsersOrder? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/offset",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "per_page": perPage?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersPaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithDoubleOffsetPagination(page: Nullable<Double>? = nil, perPage: Nullable<Double>? = nil, order: InlineUsersOrder? = nil, startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/double-offset",
            queryParams: [
                "page": page?.wrappedValue.map { .double($0) }, 
                "per_page": perPage?.wrappedValue.map { .double($0) }, 
                "order": order.map { .string($0.rawValue) }, 
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersPaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithBodyOffsetPagination(request: Requests.InlineUsersInlineUsersListWithBodyOffsetPaginationRequest, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/inline-users/body-offset",
            body: request,
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersPaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithOffsetStepPagination(page: Nullable<Int>? = nil, limit: Nullable<Int>? = nil, order: InlineUsersOrder? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/offset-step",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "limit": limit?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersPaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithOffsetPaginationHasNextPage(page: Nullable<Int>? = nil, limit: Nullable<Int>? = nil, order: InlineUsersOrder? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/offset-has-next-page",
            queryParams: [
                "page": page?.wrappedValue.map { .int($0) }, 
                "limit": limit?.wrappedValue.map { .int($0) }, 
                "order": order.map { .string($0.rawValue) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersPaginationResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithExtendedResults(cursor: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersExtendedResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/extended",
            queryParams: [
                "cursor": cursor?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersExtendedResponse.self
        )
    }

    public func inlineUsersInlineUsersListWithExtendedResultsAndOptionalData(cursor: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersListUsersExtendedOptionalListResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/extended-optional",
            queryParams: [
                "cursor": cursor?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersListUsersExtendedOptionalListResponse.self
        )
    }

    public func inlineUsersInlineUsersListUsernames(startingAfter: Nullable<String>? = nil, requestOptions: RequestOptions? = nil) async throws -> UsernameCursor {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/usernames",
            queryParams: [
                "starting_after": startingAfter?.wrappedValue.map { .string($0) }
            ],
            requestOptions: requestOptions,
            responseType: UsernameCursor.self
        )
    }

    public func inlineUsersInlineUsersListWithGlobalConfig(offset: Nullable<Int>? = nil, requestOptions: RequestOptions? = nil) async throws -> InlineUsersUsernameContainer {
        return try await httpClient.performRequest(
            method: .get,
            path: "/inline-users/global-config",
            queryParams: [
                "offset": offset?.wrappedValue.map { .int($0) }
            ],
            requestOptions: requestOptions,
            responseType: InlineUsersUsernameContainer.self
        )
    }
}