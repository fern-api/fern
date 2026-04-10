import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient(baseURL: "https://api.fern.com")

    _ = try await client.foo.find(
        optionalString: "optionalString",
        request: .init(
            publicProperty: "publicProperty",
            privateProperty: 1
        )
    )
}

try await main()
