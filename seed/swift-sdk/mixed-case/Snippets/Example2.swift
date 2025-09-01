import MixedCase

let client = SeedMixedCaseClient()

try await client.service.listResources(
    request: .init(
        pageLimit: 10,
        beforeDate: Date(timeIntervalSince1970: 1672531200)
    )
)
