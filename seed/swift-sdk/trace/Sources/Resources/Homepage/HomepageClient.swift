import Foundation

public final class HomepageClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    /// 
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    /// 
    ///     _ = try await client.homepage.getHomepageProblems()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getHomepageProblems(requestOptions: RequestOptions? = nil) async throws -> [ProblemId] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/homepage-problems",
            requestOptions: requestOptions,
            responseType: [ProblemId].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    /// 
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    /// 
    ///     _ = try await client.homepage.setHomepageProblems(request: [
    ///         "string",
    ///         "string"
    ///     ])
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func setHomepageProblems(request: [ProblemId], requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/homepage-problems",
            body: request,
            requestOptions: requestOptions
        )
    }
}