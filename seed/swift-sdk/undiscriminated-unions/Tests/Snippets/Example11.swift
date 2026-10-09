import Foundation
import UndiscriminatedUnions

enum Example11 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.getWithBaseProperties(request: UnionWithBaseProperties.namedMetadata(
            NamedMetadata(
                name: "name",
                value: [
                    "value": .object([
                        "key": .string("value")
                    ])
                ]
            )
        ))
    }
}
