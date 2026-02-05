import Foundation

public final class OptionalClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func sendOptionalBody(request: [String: JSONValue]?, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/send-optional-body",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func sendOptionalTypedBody(request: SendOptionalBodyRequest?, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/send-optional-typed-body",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// Tests optional(nullable(T)) where T has only optional properties.
    /// This should not generate wire tests expecting {} when Optional.empty() is passed.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func sendOptionalNullableWithAllOptionalProperties(actionId: String, id: String, request: Nullable<DeployParams>?, requestOptions: RequestOptions? = nil) async throws -> DeployResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/deploy/\(actionId)/versions/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: DeployResponse.self
        )
    }
}