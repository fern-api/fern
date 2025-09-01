import BasicAuthEnvironmentVariables

let client = SeedBasicAuthEnvironmentVariablesClient(
    username: "<username>",
    accessToken: "<password>"
)

try await client.basicAuth.postWithBasicAuth(
    request: .object([
        "key": .string("value")
    ])
)
