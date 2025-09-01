import MyCustomModule

let client = MyCustomClient(token: "<token>")

private func main() async throws {
    try await client.service.deleteUser(
        userId: "userId"
    )
}

try await main()
