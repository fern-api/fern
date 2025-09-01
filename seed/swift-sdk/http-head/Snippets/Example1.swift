import HttpHead

let client = SeedHttpHeadClient()

try await client.user.list(
    request: .init(limit: 1)
)
