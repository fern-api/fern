import Foundation

public final class NullableClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getusers(usernames: Nullable<String>? = nil, avatar: Nullable<String>? = nil, activated: Nullable<Bool>? = nil, tags: Nullable<String>? = nil, extra: Nullable<Bool>? = nil, requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            queryParams: [
                "usernames": usernames?.wrappedValue.map { .string($0) }, 
                "avatar": avatar?.wrappedValue.map { .string($0) }, 
                "activated": activated?.wrappedValue.map { .bool($0) }, 
                "tags": tags?.wrappedValue.map { .string($0) }, 
                "extra": extra?.wrappedValue.map { .bool($0) }
            ],
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func createuser(request: Requests.NullableCreateUserRequest, requestOptions: RequestOptions? = nil) async throws -> User {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: User.self
        )
    }

    public func deleteuser(request: Requests.NullableDeleteUserRequest, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/users",
            body: request,
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}