import Api

private func main() async throws {
    let client = SeedApiClient()

    try await client.getAccount(accountId: "account_id")
}

try await main()
