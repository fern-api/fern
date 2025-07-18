public final class ProblemClient: Sendable {
    private let httpClient: HTTPClient

    public init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func getLightweightProblems(requestOptions: RequestOptions? = nil) async throws -> [LightweightProblemInfoV2] {
    }

    public func getProblems(requestOptions: RequestOptions? = nil) async throws -> [ProblemInfoV2] {
    }

    public func getLatestProblem(requestOptions: RequestOptions? = nil) async throws -> ProblemInfoV2 {
    }

    public func getProblemVersion(requestOptions: RequestOptions? = nil) async throws -> ProblemInfoV2 {
    }
}}
}