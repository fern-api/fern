import Foundation
import ObjectsWithImports

private func main() async throws {
    let client = ObjectsWithImportsClient(baseURL: "https://api.fern.com")

    try await client.optional.sendOptionalBody(request: [
        "string": .object([
            "key": .string("value")
        ])
    ])
}

try await main()
