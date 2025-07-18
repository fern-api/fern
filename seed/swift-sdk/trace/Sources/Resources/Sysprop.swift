public final class SyspropClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func setNumWarmInstances(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func getNumWarmInstances(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}