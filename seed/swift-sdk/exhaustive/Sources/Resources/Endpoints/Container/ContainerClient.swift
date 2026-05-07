import Foundation

public final class ContainerClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnListOfPrimitives(request: [String], requestOptions: RequestOptions? = nil) async throws -> [String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/list-of-primitives",
            body: request,
            requestOptions: requestOptions,
            responseType: [String].self
        )
    }

    public func getAndReturnListOfObjects(request: [TypesObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [TypesObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/list-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: [TypesObjectWithRequiredField].self
        )
    }

    public func getAndReturnSetOfPrimitives(request: [String], requestOptions: RequestOptions? = nil) async throws -> [String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-primitives",
            body: request,
            requestOptions: requestOptions,
            responseType: [String].self
        )
    }

    public func getAndReturnSetOfObjects(request: [TypesObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [TypesObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: [TypesObjectWithRequiredField].self
        )
    }

    public func getAndReturnMapPrimToPrim(request: [String: String], requestOptions: RequestOptions? = nil) async throws -> [String: String] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-prim",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: String].self
        )
    }

    public func getAndReturnMapOfPrimToObject(request: [String: TypesObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [String: TypesObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-object",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: TypesObjectWithRequiredField].self
        )
    }

    public func getAndReturnMapOfPrimToUndiscriminatedUnion(request: [String: TypesMixedType], requestOptions: RequestOptions? = nil) async throws -> [String: TypesMixedType] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-union",
            body: request,
            requestOptions: requestOptions,
            responseType: [String: TypesMixedType].self
        )
    }

    public func getAndReturnOptional(request: TypesObjectWithRequiredField, requestOptions: RequestOptions? = nil) async throws -> TypesObjectWithRequiredField {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/opt-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: TypesObjectWithRequiredField.self
        )
    }
}