import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.container.getAndReturnOptional(request: ObjectWithRequiredField(
        string: "string"
    ))
}

try await main()
