import Foundation

public final class UsersClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func listwithuripagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersUriPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/uri",
            requestOptions: requestOptions,
            responseType: ListUsersUriPaginationResponse.self
        )
    }

    public func listwithpathpagination(requestOptions: RequestOptions? = nil) async throws -> ListUsersPathPaginationResponse {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/path",
            requestOptions: requestOptions,
            responseType: ListUsersPathPaginationResponse.self
        )
    }
}