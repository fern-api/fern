import Foundation

public final class DummyClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import SingleUrlEnvironmentNoDefault
    ///
    /// private func main() async throws {
    ///     let client = SingleUrlEnvironmentNoDefaultClient(token: "<token>")
    ///
    ///     _ = try await client.dummy.getDummy()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getDummy(requestOptions: RequestOptions? = nil) async throws -> String {
        return try await httpClient.performRequest(
            method: .get,
            path: "/dummy",
            requestOptions: requestOptions,
            responseType: String.self
        )
    }
}