import Foundation
import UndiscriminatedUnions

enum Example8 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.nestedUnions(request: NestedUnionRoot.string(
            "string"
        ))
    }
}
