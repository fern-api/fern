import Api

let client = SeedApiClient()

try await client.getAccount(
    accountId: "account_id"
)
