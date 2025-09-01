import MixedCase

private func main() async throws {
    let client = SeedMixedCaseClient()

    try await client.service.getResource(resourceId: "ResourceID")
}

try await main()
