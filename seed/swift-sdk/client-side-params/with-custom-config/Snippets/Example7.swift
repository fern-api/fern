import MyCustomModule

let client = MyCustomClient(token: "<token>")

try await client.service.deleteUser(
    userId: "userId"
)
