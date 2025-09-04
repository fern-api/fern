import Foundation
import AliasExtends

private func main() async throws {
    let client = AliasExtendsClient(baseURL: "https://api.fern.com")

    try await client.extendedInlineRequestBody(request: .init(
        parent: "parent",
        child: "child"
    ))
}

try await main()
