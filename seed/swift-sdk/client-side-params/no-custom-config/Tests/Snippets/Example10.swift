import Foundation
import ClientSideParams

enum Example10 {
    static func snippet() async throws {
        let client = ClientSideParamsClient(
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
