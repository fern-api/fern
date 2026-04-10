import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.service.post(
        pathParam: "pathParam",
        serviceParam: "serviceParam",
        endpointParam: 1,
        resourceParam: "resourceParam"
    )
}

try await main()
