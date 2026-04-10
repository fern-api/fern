import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpointsContainer.endpointsContainerGetAndReturnMapOfPrimToObject(request: [
        "string": TypesObjectWithRequiredField(
            string: "string"
        )
    ])
}

try await main()
