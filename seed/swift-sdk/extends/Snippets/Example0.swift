import Foundation
import Extends

private func main() async throws {
    let client = ExtendsClient(baseURL: "https://api.fern.com")

    _ = try await client.extendedInlineRequestBody(request: .init(
        name: "name",
        docs: "docs",
        unique: "unique"
    ))
}

try await main()
