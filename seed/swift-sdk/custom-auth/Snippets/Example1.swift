import CustomAuth

let client = SeedCustomAuthClient(customAuthScheme: "<value>")

try await client.customAuth.postWithCustomAuth(
    request: .object([
        "key": .string("value")
    ])
)
