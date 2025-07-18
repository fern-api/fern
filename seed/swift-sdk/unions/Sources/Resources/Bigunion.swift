public final class BigunionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) throws -> BigUnion {
    }

    public func update(requestOptions: RequestOptions? = nil) throws -> Bool {
    }

    public func updateMany(requestOptions: RequestOptions? = nil) throws -> Any {
    }
}