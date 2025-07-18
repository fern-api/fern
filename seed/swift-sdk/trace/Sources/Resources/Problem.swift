public final class ProblemClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createProblem(requestOptions: RequestOptions? = nil) throws -> CreateProblemResponse {
    }

    public func updateProblem(requestOptions: RequestOptions? = nil) throws -> UpdateProblemResponse {
    }

    public func deleteProblem(requestOptions: RequestOptions? = nil) throws -> Any {
    }

    public func getDefaultStarterFiles(requestOptions: RequestOptions? = nil) throws -> GetDefaultStarterFilesResponse {
    }
}