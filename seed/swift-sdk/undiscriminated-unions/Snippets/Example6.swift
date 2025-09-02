import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient()

    try await client.union.nestedUnions(request: NestedUnionRoot.string(
        "string"
    ))
}

try await main()
