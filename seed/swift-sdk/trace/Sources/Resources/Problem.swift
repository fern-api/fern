public final class ProblemClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createProblem(requestOptions: RequestOptions? = nil) async throws -> CreateProblemResponse {
        fatalError("Not implemented.")
    }

    public func updateProblem(requestOptions: RequestOptions? = nil) async throws -> UpdateProblemResponse {
        fatalError("Not implemented.")
    }

    public func deleteProblem(requestOptions: RequestOptions? = nil) async throws -> Any {
        fatalError("Not implemented.")
    }

    public func getDefaultStarterFiles(requestOptions: RequestOptions? = nil) async throws -> GetDefaultStarterFilesResponse {
        fatalError("Not implemented.")
    }
}