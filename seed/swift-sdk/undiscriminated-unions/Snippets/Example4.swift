import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

    try await client.union.updateMetadata(request: MetadataUnion.optionalStringToJsonDictionary(
        [
            "string": .object([
                "key": .string("value")
            ])
        ]
    ))
}

try await main()
