import AuthEnvironmentVariables

let client = SeedAuthEnvironmentVariablesClient(apiKey: "<value>")

private func main() async throws {
    try await client.service.getWithApiKey(

    )
}

try await main()
