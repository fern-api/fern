import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.params.modifyWithInlinePath(
        param: "param",
        request: "string"
    )
}

try await main()
