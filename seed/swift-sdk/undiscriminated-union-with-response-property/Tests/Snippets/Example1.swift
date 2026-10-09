import Foundation
import UndiscriminatedUnionWithResponseProperty

enum Example1 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionWithResponsePropertyClient(baseURL: "https://api.fern.com")

        _ = try await client.listUnions()
    }
}
