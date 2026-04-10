import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.union.call(request: .init(union: MetadataUnion.nullableOptionalMetadata(
        .value(.value([
            "union": .object([
                "key": .string("value")
            ])
        ]))
    )))
}

try await main()
