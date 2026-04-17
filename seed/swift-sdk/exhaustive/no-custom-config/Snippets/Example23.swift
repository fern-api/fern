import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnWithUnknownField(request: ObjectWithUnknownField(
        unknown: .object([
            "key": .string("value")
        ])
    ))
}

try await main()
