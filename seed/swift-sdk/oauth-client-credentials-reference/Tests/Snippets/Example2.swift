import Foundation
import OauthClientCredentialsReference

enum Example2 {
    static func snippet() async throws {
        let client = OauthClientCredentialsReferenceClient(baseURL: "https://api.fern.com")

        _ = try await client.simple.getSomething()
    }
}
