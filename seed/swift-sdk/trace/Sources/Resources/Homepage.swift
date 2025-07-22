public final class HomepageClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getHomepageProblems(requestOptions: RequestOptions? = nil) async throws -> [ProblemId] {
        return try await httpClient.performRequest(
            method: .get, 
            path: "/homepage-problems", 
            requestOptions: requestOptions, 
            responseType: [ProblemId].self
        )
    }

    public func setHomepageProblems(request: [ProblemId], requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/homepage-problems", 
            body: request, 
            requestOptions: requestOptions, 
            responseType: Any.self
        )
    }
}