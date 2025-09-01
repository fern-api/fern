import Version

let client = SeedVersionClient()

try await client.user.getUser(
    userId: "userId"
)
