import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.union.aliasedObjectUnion(request: AliasedObjectUnion.aliasedLeafA(
        LeafObjectA(
            onlyInA: "onlyInA",
            sharedNumber: 1
        )
    ))
}

try await main()
