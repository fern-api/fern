import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.union.nestedUnions(request: NestedUnionRoot.string(
        "string"
    ))
}

try await main()
