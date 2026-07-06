import Foundation

public final class ProductsClient: Sendable {
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
    ///     _ = try await client.products.search(
    ///         regionId: "regionId",
    ///         request: .init()
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func search(regionId: String, request: Requests.SearchProductsRequest, requestOptions: RequestOptions? = nil) async throws -> SearchProductsResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/v1/products/\(regionId)/search",
            body: request,
            requestOptions: requestOptions,
            responseType: SearchProductsResponse.self
        )
    }

    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.products.get(
    ///         regionId: "regionId",
    ///         productId: "productId"
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
    public func get(regionId: String, productId: String, requestOptions: RequestOptions? = nil) async throws -> Product {
        return try await httpClient.performRequest(
            method: .get,
            path: "/v1/products/\(regionId)/\(productId)",
            requestOptions: requestOptions,
            responseType: Product.self
        )
    }
}