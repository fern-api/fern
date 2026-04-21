import Foundation

public final class HttpMethodsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func testGet(id: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/http-methods/\(id)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    @available(*, deprecated) public func testPost(request: ObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/http-methods",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    @available(*, deprecated, message: "Use testPatch instead.") public func testPut(id: String, request: ObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .put,
            path: "/http-methods/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    /// - Warning: This endpoint is in pre-release and may change.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func testPatch(id: String, request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/http-methods/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    /// - Warning: This endpoint is in development and may change.
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func testDelete(id: String, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/http-methods/\(id)",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}