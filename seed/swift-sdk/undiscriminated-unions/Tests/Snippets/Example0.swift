import Foundation
import UndiscriminatedUnions

enum Example0 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.get(request: MyUnion.string(
            "string"
        ))
    }
}
