import Foundation

public final class SyspropClient: Sendable {
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
    ///     _ = try await client.sysprop.setNumWarmInstances(
    ///         language: "JAVA",
    ///         numWarmInstances: "1"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func setNumWarmInstances(language: String, numWarmInstances: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .put,
            path: "/sysprop/num-warm-instances/\(language)/\(numWarmInstances)",
            requestOptions: requestOptions
        )
    }

    /// ```swift
    /// import Foundation
    /// import Trace
    ///
    /// private func main() async throws {
    ///     let client = TraceClient(token: "<token>")
    ///
    ///     _ = try await client.sysprop.getNumWarmInstances()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getNumWarmInstances(requestOptions: RequestOptions? = nil) async throws -> [Language: Int] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/sysprop/num-warm-instances",
            requestOptions: requestOptions,
            responseType: [Language: Int].self
        )
    }
}