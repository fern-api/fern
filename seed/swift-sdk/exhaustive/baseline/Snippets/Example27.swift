import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.object.getAndReturnWithMixedRequiredAndOptionalFields(request: ObjectWithMixedRequiredAndOptionalFields(
        requiredString: "requiredString",
        requiredInteger: 1,
        optionalString: "optionalString",
        requiredLong: 1000000
    ))
}

try await main()
