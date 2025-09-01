import BasicAuth

let client = SeedBasicAuthClient(
    username: "<username>",
    password: "<password>"
)

private func main() async throws {
    try await client.basicAuth.postWithBasicAuth(
        request: .object([
            "key": .string("value")
        ])
    )
}

try await main()
