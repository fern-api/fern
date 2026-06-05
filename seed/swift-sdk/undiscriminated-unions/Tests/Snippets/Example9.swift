import Foundation
import UndiscriminatedUnions

enum Example9 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.nestedObjectUnions(request: OuterNestedUnion.string(
            "string"
        ))
    }
}
