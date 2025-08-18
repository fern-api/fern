import Foundation

public final class NullableClient_: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getUsers(usernames: String? = nil, avatar: String? = nil, activated: Bool? = nil, tags: JSONValue? = nil, extra: JSONValue? = nil, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "usernames": usernames.map { .string($0) }, 
                "avatar": avatar.map { .string($0) }, 
                "activated": activated.map { .bool($0) }, 
                "tags": tags.map { .unknown($0) }, 
                "extra": extra.map { .unknown($0) }
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func createUser(request: CreateUserRequest, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func deleteUser(request: DeleteUserRequest, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}