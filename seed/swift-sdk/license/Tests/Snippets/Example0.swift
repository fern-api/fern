import Foundation
import License

enum Example0 {
    static func snippet() async throws {
        let client = LicenseClient(baseURL: "https://api.fern.com")

        _ = try await client.get()
    }
}
