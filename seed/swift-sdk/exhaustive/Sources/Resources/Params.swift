public final class ParamsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithPath(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func getWithInlinePath(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func getWithQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func getWithAllowMultipleQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func getWithPathAndQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func getWithInlinePathAndQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
    }

    public func modifyWithPath(requestOptions: RequestOptions? = nil) async throws -> String {
    }

    public func modifyWithInlinePath(requestOptions: RequestOptions? = nil) async throws -> String {
    }
}