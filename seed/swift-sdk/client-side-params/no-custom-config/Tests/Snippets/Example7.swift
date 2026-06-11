import Foundation
import ClientSideParams

enum Example7 {
    static func snippet() async throws {
        let client = ClientSideParamsClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.service.deleteUser(userId: "userId")
    }
}
