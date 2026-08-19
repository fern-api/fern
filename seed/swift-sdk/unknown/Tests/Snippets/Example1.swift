import Foundation
import UnknownAsAny

enum Example1 {
    static func snippet() async throws {
        let client = UnknownAsAnyClient(baseURL: "https://api.fern.com")

        _ = try await client.unknown.postObject(request: MyObject(
            unknown: .object([
                "key": .string("value")
            ])
        ))
    }
}
