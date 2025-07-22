public final class HttpMethodsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
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

    public func testPost(request: ObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/http-methods",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    public func testPut(id: String, request: ObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .put,
            path: "/http-methods/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    public func testPatch(id: String, request: ObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> ObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/http-methods/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithOptionalField.self
        )
    }

    public func testDelete(id: String, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/http-methods/\(id)",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }
}