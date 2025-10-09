import Foundation
import UndiscriminatedUnions

private func main() async throws {
    let client = UndiscriminatedUnionsClient(baseURL: "https://api.fern.com")

    _ = try await client.union.call(request: Request(
        union: MetadataUnion.optionalStringToJsonDictionary(
            [
                "string": .object([
                    "key": .string("value")
                ])
            ]
        )
    ))
}

try await main()
