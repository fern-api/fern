import Foundation
import ClientSideParams

enum Example11 {
    static func snippet() async throws {
        let client = ClientSideParamsClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.getClient(
            clientId: "clientId",
            fields: "fields",
            includeFields: true
        )
    }
}
