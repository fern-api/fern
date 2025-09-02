import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient()

    try await client.union.updateMetadata(request: MetadataUnion.optionalStringToJsonDictionary(
        [
            "string": .object([
                "key": .string("value")
            ])
        ]
    ))
}

try await main()
