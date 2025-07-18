public final class SyspropClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func setNumWarmInstances(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func getNumWarmInstances(requestOptions: RequestOptions? = nil) throws -> Any {
    }
}