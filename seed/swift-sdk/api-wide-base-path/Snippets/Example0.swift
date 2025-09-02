import Foundation
import ApiWideBasePath

private func main() async throws {
    let client = SeedApiWideBasePathClient()

    try await client.service.post(
        pathParam: "pathParam",
        serviceParam: "serviceParam",
        resourceParam: "resourceParam",
        endpointParam: 1
    )
}

try await main()
