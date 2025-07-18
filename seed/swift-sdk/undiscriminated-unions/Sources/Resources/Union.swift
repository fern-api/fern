public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) async throws -> MyUnion {
        fatalError("Not implemented.")
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) async throws -> Metadata {
        fatalError("Not implemented.")
    }

    public func updateMetadata(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }

    public func call(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }

    public func duplicateTypesUnion(requestOptions: RequestOptions? = nil) async throws -> UnionWithDuplicateTypes {
        fatalError("Not implemented.")
    }

    public func nestedUnions(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }
}