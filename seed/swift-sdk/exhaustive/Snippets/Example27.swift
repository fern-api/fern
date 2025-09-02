import Foundation
import Exhaustive

private func main() async throws {
    let client = SeedExhaustiveClient(token: "<token>")

    try await client.endpoints.params.modifyWithPath(
        param: "param",
        request: "string"
    )
}

try await main()
