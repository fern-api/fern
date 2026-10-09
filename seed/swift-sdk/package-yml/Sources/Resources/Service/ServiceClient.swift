import Foundation

public final class ServiceClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import PackageYml
    ///
    /// private func main() async throws {
    ///     let client = PackageYmlClient()
    ///
    ///     _ = try await client.service.nop(
    ///         id: "id-a2ijs82",
    ///         nestedId: "id-219xca8"
    ///     )
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func nop(id: String, nestedId: String, requestOptions: RequestOptions? = nil) async throws -> Void {
        return try await httpClient.performRequest(
            method: .get,
            path: "/\(id)//\(nestedId)",
            requestOptions: requestOptions
        )
    }
}