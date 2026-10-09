import Foundation
import MyCustomModule

enum Example0 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.listResources(
            page: 1,
            perPage: 1,
            sort: "created_at",
            order: "desc",
            includeTotals: true,
            fields: "fields",
            search: "search"
        )
    }
}
