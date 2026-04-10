import Foundation

public final class V2V3ProblemClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// Returns lightweight versions of all problems
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2V3ProblemGetLightweightProblems(requestOptions: RequestOptions? = nil) async throws -> [V2V3LightweightProblemInfoV2] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/v3/lightweight-problem-info",
            requestOptions: requestOptions,
            responseType: [V2V3LightweightProblemInfoV2].self
        )
    }

    /// Returns latest versions of all problems
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2V3ProblemGetProblems(requestOptions: RequestOptions? = nil) async throws -> [V2V3ProblemInfoV2] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/v3/problem-info",
            requestOptions: requestOptions,
            responseType: [V2V3ProblemInfoV2].self
        )
    }

    /// Returns latest version of a problem
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2V3ProblemGetLatestProblem(problemId: String, requestOptions: RequestOptions? = nil) async throws -> V2V3ProblemInfoV2 {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/v3/problem-info/\(problemId)",
            requestOptions: requestOptions,
            responseType: V2V3ProblemInfoV2.self
        )
    }

    /// Returns requested version of a problem
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func v2V3ProblemGetProblemVersion(problemId: String, problemVersion: String, requestOptions: RequestOptions? = nil) async throws -> V2V3ProblemInfoV2 {
        return try await httpClient.performRequest(
            method: .get,
            path: "/problems-v2/v3/problem-info/\(problemId)/version/\(problemVersion)",
            requestOptions: requestOptions,
            responseType: V2V3ProblemInfoV2.self
        )
    }
}