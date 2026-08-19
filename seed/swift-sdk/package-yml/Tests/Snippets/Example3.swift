import Foundation
import PackageYml

enum Example3 {
    static func snippet() async throws {
        let client = PackageYmlClient(baseURL: "https://api.fern.com")

        _ = try await client.service.nop(
            id: "id",
            nestedId: "nestedId"
        )
    }
}
