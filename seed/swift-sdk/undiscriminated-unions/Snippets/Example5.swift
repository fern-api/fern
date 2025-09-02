import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient()

    try await client.union.duplicateTypesUnion(request: UnionWithDuplicateTypes.string(
        "string"
    ))
}

try await main()
