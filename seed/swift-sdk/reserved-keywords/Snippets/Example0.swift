import NurseryApi

let client = SeedNurseryApiClient()

try await client.package.test(
    request: .init(for: "for")
)
