import Foundation

public final class OptionalClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func sendoptionalbody(request: Nullable<[String: JSONValue]>, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/send-optional-body",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func sendoptionaltypedbody(request: Requests.SendOptionalBodyRequest, requestOptions: RequestOptions? = nil) async throws -> String {
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
    public func sendoptionalnullablewithalloptionalproperties(actionId: String, id: String, request: Requests.DeployParams, requestOptions: RequestOptions? = nil) async throws -> DeployResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/deploy/\(actionId)/versions/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: DeployResponse.self
        )
    }
}