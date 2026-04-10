import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getwithbearer(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/bearer",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getwithapikey(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/api-key",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getwithoauth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/oauth",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getwithbasic(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/basic",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getwithinferredauth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/inferred",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getwithanyauth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/any",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getwithallauth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/all",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}