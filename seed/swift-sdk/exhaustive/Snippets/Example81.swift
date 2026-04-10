import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsPrimitive.endpointsPrimitiveGetAndReturnLong(request: 1000000)
}

try await main()
