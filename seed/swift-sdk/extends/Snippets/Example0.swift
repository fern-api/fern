import Foundation
import Extends

private func main() async throws {
    let client = ExtendsClient()

    try await client.extendedInlineRequestBody(request: .init(
        name: "name",
        docs: "docs",
        unique: "unique"
    ))
}

try await main()
