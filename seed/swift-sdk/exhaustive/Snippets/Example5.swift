import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.endpoints.container.getAndReturnMapOfPrimToObject(request: [
        "string": ObjectWithRequiredField(
            string: "string"
        )
    ])
}

try await main()
