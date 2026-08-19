import Foundation
import ClientSideParams

enum Example4 {
    static func snippet() async throws {
        let client = ClientSideParamsClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.getUserById(
            userId: "userId",
            fields: "fields",
            includeFields: true
        )
    }
}
