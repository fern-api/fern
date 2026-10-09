import Foundation
import Enum

enum Example0 {
    static func snippet() async throws {
        let client = EnumClient(baseURL: "https://api.fern.com")

        _ = try await client.headers.send()
    }
}
