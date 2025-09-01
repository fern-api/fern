import CustomAuth

let client = SeedCustomAuthClient(customAuthScheme: "<value>")

private func main() async throws {
    try await client.customAuth.postWithCustomAuth(
        request: .object([
            "key": .string("value")
        ])
    )
}

try await main()
