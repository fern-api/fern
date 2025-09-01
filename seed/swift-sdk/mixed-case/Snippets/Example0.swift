import MixedCase

let client = SeedMixedCaseClient()

try await client.service.getResource(
    resourceId: "rsc-xyz"
)
