public final class BigunionClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func get(requestOptions: RequestOptions? = nil) async throws -> BigUnion {
        fatalError("Not implemented.")
    }

    public func update(requestOptions: RequestOptions? = nil) async throws -> Bool {
        fatalError("Not implemented.")
    }

    public func updateMany(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }
}