import Foundation

public final class PlantsClient: Sendable {
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
    ///     _ = try await client.plants.list()
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func list(requestOptions: RequestOptions? = nil) async throws -> [Plant] {
        return try await httpClient.performRequest(
            method: .get,
            path: "/plants",
            requestOptions: requestOptions,
            responseType: [Plant].self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.plants.get(plantId: "plantId")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(plantId: String, requestOptions: RequestOptions? = nil) async throws -> Plant {
        return try await httpClient.performRequest(
            method: .get,
            path: "/plants/\(plantId)",
            requestOptions: requestOptions,
            responseType: Plant.self
        )
    }
}