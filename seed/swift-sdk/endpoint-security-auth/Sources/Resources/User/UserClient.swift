import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithBearer(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/bearer",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getWithApiKey(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/api-key",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getWithOAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/oauth",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getWithBasic(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/basic",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getWithInferredAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/inferred",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getWithAnyAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/any",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    public func getWithAllAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users/all",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}