import Foundation
import UndiscriminatedUnions

enum Example10 {
    static func snippet() async throws {
        let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

        _ = try await client.union.aliasedObjectUnion(request: AliasedObjectUnion.aliasedLeafA(
            LeafObjectA(
                onlyInA: "onlyInA",
                sharedNumber: 1
            )
        ))
    }
}
