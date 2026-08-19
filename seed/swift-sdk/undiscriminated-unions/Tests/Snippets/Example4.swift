import Foundation
import UndiscriminatedUnions

enum Example4 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.updateMetadata(request: MetadataUnion.optionalMetadata(
            [
                "string": .object([
                    "key": .string("value")
                ])
            ]
        ))
    }
}
