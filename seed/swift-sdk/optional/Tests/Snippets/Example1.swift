import Foundation
import ObjectsWithImports

enum Example1 {
    static func snippet() async throws {
        let client = ObjectsWithImportsClient(baseURL: "https://api.fern.com")

        _ = try await client.optional.sendOptionalTypedBody(request: SendOptionalBodyRequest(
            message: "message"
        ))
    }
}
