public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) async throws -> Shape {
        fatalError("Not implemented.")
    }

    public func update(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }
}