import Foundation
import ApiWideBasePath

private func main() async throws {
    let client = ApiWideBasePathClient(baseURL: "https://api.fern.com")

    try await client.service.post(
        pathParam: "pathParam",
        serviceParam: "serviceParam",
        resourceParam: "resourceParam",
        endpointParam: 1
    )
}

try await main()
