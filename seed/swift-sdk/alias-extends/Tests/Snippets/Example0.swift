import Foundation
import AliasExtends

enum Example0 {
    static func snippet() async throws {
        let client = AliasExtendsClient(baseURL: "https://api.fern.com")

        _ = try await client.extendedInlineRequestBody(request: .init(
            parent: "parent",
            child: "child"
        ))
    }
}
