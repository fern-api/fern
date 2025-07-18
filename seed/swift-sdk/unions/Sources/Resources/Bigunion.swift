public final class BigunionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) async throws -> BigUnion {
    }

    public func update(requestOptions: RequestOptions? = nil) async throws -> Bool {
    }

    public func updateMany(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}