import Foundation
import UndiscriminatedUnions

enum Example7 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.duplicateTypesUnion(request: UnionWithDuplicateTypes.string(
            "string"
        ))
    }
}
