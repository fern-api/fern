import BearerTokenEnvironmentVariable

let client = SeedBearerTokenEnvironmentVariableClient(apiKey: "<token>")

private func main() async throws {
    try await client.service.getWithBearerToken(

    )
}

try await main()
