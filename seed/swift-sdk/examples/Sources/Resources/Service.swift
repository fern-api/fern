public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func check(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func ping(requestOptions: RequestOptions? = nil) throws -> Bool {
    }
}vieId {
    }

    public func getMetadata(requestOptions: RequestOptions? = nil) throws -> Metadata {
    }

    public func createBigEntity(requestOptions: RequestOptions? = nil) throws -> Response {
    }
}