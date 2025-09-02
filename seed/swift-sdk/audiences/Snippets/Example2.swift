import Foundation
import Audiences

private func main() async throws {
    let client = AudiencesClient()

    try await client.foo.find(request: .init(
        optionalString: "optionalString",
        publicProperty: "publicProperty",
        privateProperty: 1
    ))
}

try await main()
