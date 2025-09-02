import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient()

    try await client.union.get(request: MyUnion.string(
        "string"
    ))
}

try await main()
