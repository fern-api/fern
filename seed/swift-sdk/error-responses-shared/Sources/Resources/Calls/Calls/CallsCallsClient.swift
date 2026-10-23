import Foundation

public final class CallsCallsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.calls.calls.createCall()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createCall(requestOptions: RequestOptions? = nil) async throws -> Call {
        return try await httpClient.performRequest(
            method: .post,
            path: "/calls",
            requestOptions: requestOptions,
            responseType: Call.self
        )
    }
}