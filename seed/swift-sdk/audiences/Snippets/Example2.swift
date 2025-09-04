import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient(baseURL: "https://api.fern.com")

    try await client.foo.find(request: .init(
        optionalString: "optionalString",
        publicProperty: "publicProperty",
        privateProperty: 1
    ))
}

try await main()
