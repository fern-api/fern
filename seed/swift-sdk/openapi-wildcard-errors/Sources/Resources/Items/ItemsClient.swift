import Foundation

public final class ItemsClient: Sendable {
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
    ///     _ = try await client.items.createItem(request: .init(name: "name"))
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func createItem(request: Requests.CreateItemRequest, requestOptions: RequestOptions? = nil) async throws -> Item {
        return try await httpClient.performRequest(
            method: .post,
            path: "/items",
            body: request,
            requestOptions: requestOptions,
            responseType: Item.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    ///
    /// private func main() async throws {
    ///     let client = ApiClient()
    ///
    ///     _ = try await client.items.getItem(itemId: "item_id")
    /// }
    ///
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func getItem(itemId: String, requestOptions: RequestOptions? = nil) async throws -> Item {
        return try await httpClient.performRequest(
            method: .get,
            path: "/items/\(itemId)",
            requestOptions: requestOptions,
            responseType: Item.self
        )
    }
}