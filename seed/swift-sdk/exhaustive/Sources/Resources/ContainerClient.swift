public final class ContainerClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
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

    public func getAndReturnListOfObjects(request: [ObjectWithRequiredField], requestOptions: RequestOptions? = nil) async throws -> [ObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/list-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: [ObjectWithRequiredField].self
        )
    }

    public func getAndReturnSetOfPrimitives(request: Any, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-primitives",
            body: request,
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }

    public func getAndReturnSetOfObjects(request: Any, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/set-of-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }

    public func getAndReturnMapPrimToPrim(request: Any, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-prim",
            body: request,
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }

    public func getAndReturnMapOfPrimToObject(request: Any, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/map-prim-to-object",
            body: request,
            requestOptions: requestOptions,
            responseType: Any.self
        )
    }

    public func getAndReturnOptional(request: ObjectWithRequiredField?, requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField? {
        return try await httpClient.performRequest(
            method: .post,
            path: "/container/opt-objects",
            body: request,
            requestOptions: requestOptions,
            responseType: ObjectWithRequiredField?.self
        )
    }
}