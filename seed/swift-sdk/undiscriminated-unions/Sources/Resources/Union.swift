public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) async throws -> MyUnion {
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
    }

    public func updateMetadata(requestOptions: RequestOptions? = nil) async throws -> Bool {
    }

    public func call(requestOptions: RequestOptions? = nil) async throws -> Bool {
    }

    public func duplicateTypesUnion(requestOptions: RequestOptions? = nil) async throws -> UnionWithDuplicateTypes {
    }

    public func nestedUnions(requestOptions: RequestOptions? = nil) async throws -> String {
    }
}