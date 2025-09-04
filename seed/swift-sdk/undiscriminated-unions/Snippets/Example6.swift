import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

    try await client.union.nestedUnions(request: NestedUnionRoot.string(
        "string"
    ))
}

try await main()
