public final class ProblemClient__: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getLightweightProblems(requestOptions: RequestOptions? = nil) async throws -> [LightweightProblemInfoV2Type] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/lightweight-problem-info",
            requestOptions: requestOptions,
            responseType: [LightweightProblemInfoV2Type].self
        )
    }

    public func getProblems(requestOptions: RequestOptions? = nil) async throws -> [ProblemInfoV2Type] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/problem-info",
            requestOptions: requestOptions,
            responseType: [ProblemInfoV2Type].self
        )
    }

    public func getLatestProblem(problemId: String, requestOptions: RequestOptions? = nil) async throws -> ProblemInfoV2Type {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/problem-info/\(problemId)",
            requestOptions: requestOptions,
            responseType: ProblemInfoV2Type.self
        )
    }

    public func getProblemVersion(problemId: String, problemVersion: String, requestOptions: RequestOptions? = nil) async throws -> ProblemInfoV2Type {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/problem-info/\(problemId)/version/\(problemVersion)",
            requestOptions: requestOptions,
            responseType: ProblemInfoV2Type.self
        )
    }
}