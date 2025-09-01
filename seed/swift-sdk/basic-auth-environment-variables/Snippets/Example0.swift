import BasicAuthEnvironmentVariables

let client = SeedBasicAuthEnvironmentVariablesClient(
    username: "<username>",
    accessToken: "<password>"
)

private func main() async throws {
    try await client.basicAuth.getWithBasicAuth(

    )
}

try await main()
