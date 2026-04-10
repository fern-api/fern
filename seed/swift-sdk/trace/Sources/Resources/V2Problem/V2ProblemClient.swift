import Foundation

public final class V2ProblemClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Returns lightweight versions of all problems
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2ProblemGetLightweightProblems(requestOptions: RequestOptions? = nil) async throws -> [V2LightweightProblemInfoV2] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/lightweight-problem-info",
            requestOptions: requestOptions,
            responseType: [V2LightweightProblemInfoV2].self
        )
    }

    /// Returns latest versions of all problems
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2ProblemGetProblems(requestOptions: RequestOptions? = nil) async throws -> [V2ProblemInfoV2] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/problem-info",
            requestOptions: requestOptions,
            responseType: [V2ProblemInfoV2].self
        )
    }

    /// Returns latest version of a problem
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2ProblemGetLatestProblem(problemId: String, requestOptions: RequestOptions? = nil) async throws -> V2ProblemInfoV2 {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/problem-info/\(problemId)",
            requestOptions: requestOptions,
            responseType: V2ProblemInfoV2.self
        )
    }

    /// Returns requested version of a problem
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2ProblemGetProblemVersion(problemId: String, problemVersion: String, requestOptions: RequestOptions? = nil) async throws -> V2ProblemInfoV2 {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/problem-info/\(problemId)/version/\(problemVersion)",
            requestOptions: requestOptions,
            responseType: V2ProblemInfoV2.self
        )
    }
}