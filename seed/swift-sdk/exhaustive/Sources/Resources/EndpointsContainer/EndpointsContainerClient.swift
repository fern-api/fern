import Foundation

public final class EndpointsContainerClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func endpointsContainerGetAndReturnListOfPrimitives(request: [String], requestOptions: RequestOptions? = nil) async throws -> [String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/list-of-primitives",
            body: request,
            requestOptions: requestOptions,
            responseType: [String].self
        )
    }

    public func endpointsContainerGetAndReturnListOfObjects(request: [TypesObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [TypesObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/list-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: [TypesObjectWithRequiredField].self
        )
    }

    public func endpointsContainerGetAndReturnSetOfPrimitives(request: [String], requestOptions: RequestOptions? = nil) async throws -> [String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-primitives",
            body: request,
            requestOptions: requestOptions,
            responseType: [String].self
        )
    }

    public func endpointsContainerGetAndReturnSetOfObjects(request: [TypesObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [TypesObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: [TypesObjectWithRequiredField].self
        )
    }

    public func endpointsContainerGetAndReturnMapPrimToPrim(request: [String: String], requestOptions: RequestOptions? = nil) async throws -> [String: String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-prim",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: String].self
        )
    }

    public func endpointsContainerGetAndReturnMapOfPrimToObject(request: [String: TypesObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [String: TypesObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-object",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: TypesObjectWithRequiredField].self
        )
    }

    public func endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(request: [String: TypesMixedType], requestOptions: RequestOptions? = nil) async throws -> [String: TypesMixedType] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-union",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: TypesMixedType].self
        )
    }

    public func endpointsContainerGetAndReturnOptional(request: TypesObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/opt-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithRequiredField.self
        )
    }
}