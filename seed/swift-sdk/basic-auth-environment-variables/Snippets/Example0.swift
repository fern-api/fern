import BasicAuthEnvironmentVariables

private func main() async throws {
    let client = SeedBasicAuthEnvironmentVariablesClient(
        username: "<username>",
        accessToken: "<password>"
    )

    try await client.basicAuth.getWithBasicAuth()
}

try await main()
