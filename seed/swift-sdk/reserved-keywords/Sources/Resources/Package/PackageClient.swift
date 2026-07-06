import Foundation

public final class PackageClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import NurseryApi
    ///
    /// private func main() async throws {
    ///     let client = NurseryApiClient()
    ///
    ///     _ = try await client.package.test(for: "for")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func test(for: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .post,
            path: "/",
            queryParams: [
                "for": .string(`for`)
            ],
            requestOptions: requestOptions
        )
    }
}