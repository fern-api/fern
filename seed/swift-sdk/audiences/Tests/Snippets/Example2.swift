import Foundation
import Audiences

enum Example2 {
    static func snippet() async throws {
        let client = AudiencesClient(baseURL: "https://api.fern.com")

        _ = try await client.foo.find(
            optionalString: "optionalString",
            request: .init(
                publicProperty: "publicProperty",
                privateProperty: 1
            )
        )
    }
}
