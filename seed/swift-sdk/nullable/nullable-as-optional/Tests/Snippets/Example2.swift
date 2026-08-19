import Foundation
import Nullable

enum Example2 {
    static func snippet() async throws {
        let client = NullableClient(baseURL: "https://api.fern.com")

        _ = try await client.nullable.deleteUser(request: .init(username: .value("xy")))
    }
}
