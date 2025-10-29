import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.union.updateMetadata(request: MetadataUnion.optionalMetadata(
        [
            "string": .object([
                "key": .string("value")
            ])
        ]
    ))
}

try await main()
