public final class ProblemClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func createProblem(requestOptions: RequestOptions? = nil) async throws -> CreateProblemResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/problem-crud/create", 
            requestOptions: requestOptions
        )
    }

    public func updateProblem(problemId: String, requestOptions: RequestOptions? = nil) async throws -> UpdateProblemResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/problem-crud/update/\(problemId)", 
            requestOptions: requestOptions
        )
    }

    public func deleteProblem(problemId: String, requestOptions: RequestOptions? = nil) async throws -> Any {
        return try await httpClient.performRequest(
            method: .delete, 
            path: "/problem-crud/delete/\(problemId)", 
            requestOptions: requestOptions
        )
    }

    public func getDefaultStarterFiles(requestOptions: RequestOptions? = nil) async throws -> GetDefaultStarterFilesResponse {
        return try await httpClient.performRequest(
            method: .post, 
            path: "/problem-crud/default-starter-files", 
            requestOptions: requestOptions
        )
    }
}          requestOptions: requestOptions
        )
    }
}