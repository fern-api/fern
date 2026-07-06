import Foundation

public final class ProductsClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func search(regionId: String, request: Requests.SearchProductsRequest, requestOptions: RequestOptions? = nil) async throws -> SearchProductsResponse {
        return try await httpClient.performRequest(
            method: .post,
            path: "/v1/products/\(regionId)/search",
            body: request,
            requestOptions: requestOptions,
            responseType: SearchProductsResponse.self
        )
    }

    public func get(regionId: String, productId: String, requestOptions: RequestOptions? = nil) async throws -> Product {
        return try await httpClient.performRequest(
            method: .get,
            path: "/v1/products/\(regionId)/\(productId)",
            requestOptions: requestOptions,
            responseType: Product.self
        )
    }
}