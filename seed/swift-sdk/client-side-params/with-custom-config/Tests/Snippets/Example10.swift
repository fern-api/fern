import Foundation
import MyCustomModule

enum Example10 {
    static func snippet() async throws {
        let client = MyCustomClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.listClients(
            fields: "fields",
            includeFields: true,
            page: 1,
            perPage: 1,
            includeTotals: true,
            isGlobal: true,
            isFirstParty: true,
            appType: [
                "app_type",
                "app_type"
            ]
        )
    }
}
