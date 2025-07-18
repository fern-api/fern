public final class ParamsClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getWithPath(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }

    public func getWithInlinePath(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }

    public func getWithQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getWithAllowMultipleQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getWithPathAndQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getWithInlinePathAndQuery(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func modifyWithPath(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }

    public func modifyWithInlinePath(requestOptions: RequestOptions? = nil) async throws -> String {
        fatalError("Not implemented.")
    }
}