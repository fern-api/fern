import CustomAuth

let client = SeedCustomAuthClient(customAuthScheme: "<value>")

private func main() async throws {
    try await client.customAuth.getWithCustomAuth(

    )
}

try await main()
