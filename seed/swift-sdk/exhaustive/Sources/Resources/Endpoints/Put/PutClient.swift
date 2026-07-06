import Foundation

public final class PutClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Exhaustive
    /// 
    /// private func main() async throws {
    ///     let client = ExhaustiveClient(token: "<token>")
    /// 
    ///     _ = try await client.endpoints.put.add(id: "id")
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func add(id: String, requestOptions: RequestOptions? = nil) async throws -> PutResponse {
        return try await httpClient.performRequest(
            method: .put,
            path: "/\(id)",
            requestOptions: requestOptions,
            responseType: PutResponse.self
        )
    }
}