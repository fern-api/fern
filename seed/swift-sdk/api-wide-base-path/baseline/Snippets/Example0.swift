import Foundation
import ApiWideBasePath

private func main() async throws {
    let client = ApiWideBasePathClient(baseURL: "https://api.fern.com")

    _ = try await client.service.post(
        pathParam: "pathParam",
        serviceParam: "serviceParam",
        endpointParam: 1,
        resourceParam: "resourceParam"
    )
}

try await main()
