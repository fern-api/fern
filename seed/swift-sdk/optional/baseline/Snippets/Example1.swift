import Foundation
import ObjectsWithImports

private func main() async throws {
    let client = ObjectsWithImportsClient(baseURL: "https://api.fern.com")

    _ = try await client.optional.sendOptionalTypedBody(request: SendOptionalBodyRequest(
        message: "message"
    ))
}

try await main()
