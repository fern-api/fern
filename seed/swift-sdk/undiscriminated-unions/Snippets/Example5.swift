import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.union.updatemetadata(request: MetadataUnion.nullableOptionalMetadata(
        .value(.value([
            "string": .object([
                "key": .string("value")
            ])
        ]))
    ))
}

try await main()
