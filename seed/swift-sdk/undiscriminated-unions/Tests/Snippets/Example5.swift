import Foundation
import UndiscriminatedUnions

enum Example5 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.call(request: Request(
            union: MetadataUnion.optionalMetadata(
                [
                    "string": .object([
                        "key": .string("value")
                    ])
                ]
            )
        ))
    }
}
