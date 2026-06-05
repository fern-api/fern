import Foundation
import Extends

enum Example0 {
    static func snippet() async throws {
        let client = ExtendsClient(baseURL: "https://api.fern.com")

        _ = try await client.extendedInlineRequestBody(request: .init(
            name: "name",
            docs: "docs",
            unique: "unique"
        ))
    }
}
