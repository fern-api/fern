public final class ContainerClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getAndReturnListOfPrimitives(requestOptions: RequestOptions? = nil) async throws -> [String] {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/container/list-of-primitives", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnListOfObjects(requestOptions: RequestOptions? = nil) async throws -> [ObjectWithRequiredField] {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/container/list-of-objects", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnSetOfPrimitives(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/container/set-of-primitives", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnSetOfObjects(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/container/set-of-objects", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnMapPrimToPrim(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/container/map-prim-to-prim", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnMapOfPrimToObject(requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/container/map-prim-to-object", 
            requestOptions: requestOptions
        )
    }

    public func getAndReturnOptional(requestOptions: RequestOptions? = nil) async throws -> ObjectWithRequiredField? {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/container/opt-objects", 
            requestOptions: requestOptions
        )
    }
}