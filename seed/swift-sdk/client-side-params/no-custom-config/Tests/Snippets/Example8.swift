import Foundation
import ClientSideParams

enum Example8 {
    static func snippet() async throws {
        let client = ClientSideParamsClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.listConnections(
            strategy: "strategy",
            name: "name",
            fields: "fields"
        )
    }
}
