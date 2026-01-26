import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.reqWithHeaders.getWithCustomHeader(
        xTestEndpointHeader: "X-TEST-ENDPOINT-HEADER",
        request: "string"
    )
}

try await main()
