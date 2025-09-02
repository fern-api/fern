import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = SeedUndiscriminatedUnionsClient()

    try await client.union.get(request: MyUnion.string(
        "string"
    ))
}

try await main()
