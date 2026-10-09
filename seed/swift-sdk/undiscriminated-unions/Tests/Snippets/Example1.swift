import Foundation
import UndiscriminatedUnions

enum Example1 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.getMetadata()
    }
}
