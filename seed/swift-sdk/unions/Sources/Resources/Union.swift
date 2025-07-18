public final class UnionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) throws -> Shape {
    }

    public func update(requestOptions: RequestOptions? = nil) throws -> Bool {
    }
}