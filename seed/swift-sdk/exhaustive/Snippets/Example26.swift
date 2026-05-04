import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields(request: ObjectWithMixedRequiredAndOptionalFields(
        requiredString: "hello",
        requiredInteger: 0,
        optionalString: "world",
        requiredLong: 0
    ))
}

try await main()
