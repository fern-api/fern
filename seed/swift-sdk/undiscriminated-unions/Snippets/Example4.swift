import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient()

    try await client.union.call(request: Request(
        union: MetadataUnion.optionalStringToJsonDictionary(
            [
                "union": .object([
                    "key": .string("value")
                ])
            ]
        )
    ))
}

try await main()
