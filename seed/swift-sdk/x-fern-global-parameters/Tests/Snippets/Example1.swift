import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.products.search(
            regionId: "regionId",
            request: .init(
                query: "query",
                config: SearchProductsRequestConfig(
                    currency: "currency",
                    limit: 1
                )
            )
        )
    }
}
