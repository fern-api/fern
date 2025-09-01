import BasicAuth

let client = SeedBasicAuthClient(
    username: "<username>",
    password: "<password>"
)

try await client.basicAuth.postWithBasicAuth(
    request: .object([
        "key": .string("value")
    ])
)
