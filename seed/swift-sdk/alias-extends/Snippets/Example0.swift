import Foundation
import AliasExtends

private func main() async throws {
    let client = SeedAliasExtendsClient()

    try await client.extendedInlineRequestBody(request: .init(
        parent: "parent",
        child: "child"
    ))
}

try await main()
