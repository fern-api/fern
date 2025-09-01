import MixedCase

let client = SeedMixedCaseClient()

private func main() async throws {
    try await client.service.getResource(
        resourceId: "ResourceID"
    )
}

try await main()
