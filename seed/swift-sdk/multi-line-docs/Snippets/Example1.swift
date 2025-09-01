import MultiLineDocs

let client = SeedMultiLineDocsClient()

try await client.user.createUser(
    request: .init(
        name: "name",
        age: 1
    )
)
