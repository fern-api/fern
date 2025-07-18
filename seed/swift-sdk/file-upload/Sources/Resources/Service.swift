public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func post(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func justFile(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func justFileWithQueryParams(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func withContentType(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func withFormEncoding(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func withFormEncodedContainers(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func optionalArgs(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func simple(requestOptions: RequestOptions? = nil) async throws -> Any {
    }
}