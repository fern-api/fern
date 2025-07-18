public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) throws -> MyUnion {
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) throws -> Metadata {
    }

    public func updateMetadata(requestOptions: RequestOptions? = nil) throws -> Bool {
    }

    public func call(requestOptions: RequestOptions? = nil) throws -> Bool {
    }

    public func duplicateTypesUnion(requestOptions: RequestOptions? = nil) throws -> UnionWithDuplicateTypes {
    }

    public func nestedUnions(requestOptions: RequestOptions? = nil) throws -> String {
    }
}