import Foundation

public final class OptionalClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import ObjectsWithImports
    /// 
    /// private func main() async throws {
    ///     let client = ObjectsWithImportsClient()
    /// 
    ///     _ = try await client.optional.sendOptionalBody(request: [
    ///         "string": .object([
    ///             "key": .string("value")
    ///         ])
    ///     ])
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func sendOptionalBody(request: [String: JSONValue]? = nil, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post,
            path: "/send-optional-body",
            body: request,
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import ObjectsWithImports
    /// 
    /// private func main() async throws {
    ///     let client = ObjectsWithImportsClient()
    /// 
    ///     _ = try await client.optional.sendOptionalTypedBody(request: SendOptionalBodyRequest(
    ///         message: "message"
    ///     ))
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func sendOptionalTypedBody(request: SendOptionalBodyRequest? = nil, requestOptions: RequestOptions? = nil) async throws -> String {
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
    /// ```swift
    /// import Foundation
    /// import ObjectsWithImports
    /// 
    /// private func main() async throws {
    ///     let client = ObjectsWithImportsClient()
    /// 
    ///     _ = try await client.optional.sendOptionalNullableWithAllOptionalProperties(
    ///         actionId: "actionId",
    ///         id: "id",
    ///         request: .value(DeployParams(
    ///             updateDraft: true
    ///         ))
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func sendOptionalNullableWithAllOptionalProperties(actionId: String, id: String, request: Nullable<DeployParams>? = nil, requestOptions: RequestOptions? = nil) async throws -> DeployResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/deploy/\(actionId)/versions/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: DeployResponse.self
        )
    }
}