import Foundation

public final class UserClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.user.getWithBearer()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithBearer(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.user.getWithBearer()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithApiKey(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.user.getWithBearer()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithOAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.user.getWithBearer()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithBasic(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.user.getWithBearer()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithInferredAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.user.getWithBearer()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithAnyAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import EndpointSecurityAuth
    ///
    /// private func main() async throws {
    ///     let client = EndpointSecurityAuthClient(token: "<token>")
    ///
    ///     _ = try await client.user.getWithBearer()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getWithAllAuth(requestOptions: RequestOptions? = nil) async throws -> [User] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/users",
            requestOptions: requestOptions,
            responseType: [User].self
        )
    }
}