public final class HomepageClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getHomepageProblems(requestOptions: RequestOptions? = nil) async throws -> [ProblemId] {
        fatalError("Not implemented.")
    }

    public func setHomepageProblems(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }
}