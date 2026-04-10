import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToUndiscriminatedUnion(request: [
        "key": TypesMixedType.double(
            1.1
        )
    ])
}

try await main()
