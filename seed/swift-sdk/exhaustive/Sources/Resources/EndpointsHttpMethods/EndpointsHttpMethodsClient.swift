import Foundation

public final class EndpointsHttpMethodsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsHttpMethodsTestGet(id: String, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/http-methods/\(id)",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }

    public func endpointsHttpMethodsTestPut(id: String, request: TypesObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .put,
            path: "/http-methods/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithOptionalField.self
        )
    }

    public func endpointsHttpMethodsTestDelete(id: String, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/http-methods/\(id)",
            requestOptions: requestOptions,
            responseType: Bool.self
        )
    }

    public func endpointsHttpMethodsTestPatch(id: String, request: TypesObjectWithOptionalField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .patch,
            path: "/http-methods/\(id)",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithOptionalField.self
        )
    }

    public func endpointsHttpMethodsTestPost(request: TypesObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithOptionalField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/http-methods",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithOptionalField.self
        )
    }
}