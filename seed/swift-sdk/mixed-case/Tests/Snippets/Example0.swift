import Foundation
import MixedCase

enum Example0 {
    static func snippet() async throws {
        let client = MixedCaseClient(baseURL: "https://api.fern.com")

        _ = try await client.service.getResource(resourceId: "rsc-xyz")
    }
}
