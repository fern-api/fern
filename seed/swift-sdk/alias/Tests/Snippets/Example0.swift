import Foundation
import Alias

enum Example0 {
    static func snippet() async throws {
        let client = AliasClient(baseURL: "https://api.fern.com")

        _ = try await client.get(typeId: "typeId")
    }
}
