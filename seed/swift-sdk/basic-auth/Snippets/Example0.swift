import BasicAuth

let client = SeedBasicAuthClient(
    username: "<username>",
    password: "<password>"
)

private func main() async throws {
    try await client.basicAuth.getWithBasicAuth(

    )
}

try await main()
