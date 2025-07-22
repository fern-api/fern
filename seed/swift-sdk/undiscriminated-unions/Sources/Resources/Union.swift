public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(request: MyUnion, requestOptions: RequestOptions? = nil) async throws -> MyUnion {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/metadata", 
            requestOptions: requestOptions
        )
    }

    public func updateMetadata(request: MetadataUnion, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .put, 
            path: "/metadata", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func call(request: Request, requestOptions: RequestOptions? = nil) async throws -> Bool {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/call", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func duplicateTypesUnion(request: UnionWithDuplicateTypes, requestOptions: RequestOptions? = nil) async throws -> UnionWithDuplicateTypes {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/duplicate", 
            body: request, 
            requestOptions: requestOptions
        )
    }

    public func nestedUnions(request: NestedUnionRoot, requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/nested", 
            body: request, 
            requestOptions: requestOptions
        )
    }
}