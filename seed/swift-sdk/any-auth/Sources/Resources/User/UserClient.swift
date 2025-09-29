import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getAdmins(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/admins",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}