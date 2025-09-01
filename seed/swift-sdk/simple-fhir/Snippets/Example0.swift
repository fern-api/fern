import Api

let client = SeedApiClient()

private func main() async throws {
    try await client.getAccount(
        accountId: "account_id"
    )
}

try await main()
