public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getResource(requestOptions: RequestOptions? = nil) async throws -> Resource {
        fatalError("Not implemented.")
    }

    public func listResources(requestOptions: RequestOptions? = nil) async throws -> [Resource] {
        fatalError("Not implemented.")
    }
}