public final class ProblemClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Creates a problem
    ///
    /// - Parameter request: 
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createProblem(request: CreateProblemRequest, requestOptions: RequestOptions? = nil) async throws -> CreateProblemResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/problem-crud/create",
            body: request,
            requestOptions: requestOptions,
            responseType: CreateProblemResponse.self
        )
    }

    /// Updates a problem
    ///
    /// - Parameter problemId: 
    /// - Parameter request: 
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func updateProblem(problemId: String, request: CreateProblemRequest, requestOptions: RequestOptions? = nil) async throws -> UpdateProblemResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/problem-crud/update/\(problemId)",
            body: request,
            requestOptions: requestOptions,
            responseType: UpdateProblemResponse.self
        )
    }

    /// Soft deletes a problem
    ///
    /// - Parameter problemId: 
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func deleteProblem(problemId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .delete,
            path: "/problem-crud/delete/\(problemId)",
            requestOptions: requestOptions
        )
    }

    /// Returns default starter files for problem
    ///
    /// - Parameter request: 
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getDefaultStarterFiles(request: GetDefaultStarterFilesRequest, requestOptions: RequestOptions? = nil) async throws -> GetDefaultStarterFilesResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/problem-crud/default-starter-files",
            body: request,
            requestOptions: requestOptions,
            responseType: GetDefaultStarterFilesResponse.self
        )
    }
}