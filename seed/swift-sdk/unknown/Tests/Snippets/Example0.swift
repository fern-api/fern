import Foundation
import UnknownAsAny

enum Example0 {
    static func snippet() async throws {
        let client = UnknownAsAnyClient(baseURL: "https://api.fern.com")

        _ = try await client.unknown.post(request: .object([
            "key": .string("value")
        ]))
    }
}
