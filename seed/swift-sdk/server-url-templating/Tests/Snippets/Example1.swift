import Foundation
import Api

enum Example1 {
    static func snippet() async throws {
        let client = ApiClient()

        _ = try await client.getUsers()
    }
}
