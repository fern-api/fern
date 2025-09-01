import MyCustomModule

let client = MyCustomClient(token: "<token>")

try await client.service.getUserById(
    userId: "userId",
    request: .init(
        userId: "userId",
        fields: "fields",
        includeFields: True
    )
)
