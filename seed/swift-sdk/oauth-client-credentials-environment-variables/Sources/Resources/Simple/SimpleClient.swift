import Foundation

public final class SimpleClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import OauthClientCredentialsEnvironmentVariables
    /// 
    /// private func main() async throws {
    ///     let client = OauthClientCredentialsEnvironmentVariablesClient()
    /// 
    ///     _ = try await client.simple.getSomething()
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getSomething(requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/get-something",
            requestOptions: requestOptions
        )
    }
}