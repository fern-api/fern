import MultiLineDocs

let client = SeedMultiLineDocsClient()

try await client.user.getUser(
    userId: "userId"
)
