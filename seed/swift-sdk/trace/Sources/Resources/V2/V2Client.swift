import Foundation

public final class V2Client: Sendable {
    public let problem: V2ProblemClient
    public let v3: V3Client
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.problem = V2ProblemClient(config: config)
        self.v3 = V3Client(config: config)
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.v2.test()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func test(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/",
            requestOptions: requestOptions
        )
    }
}