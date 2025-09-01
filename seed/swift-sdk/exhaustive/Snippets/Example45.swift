import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

try await client.noAuth.postWithNoAuth(
    request: .object([
        "key": .string("value")
    ])
)
