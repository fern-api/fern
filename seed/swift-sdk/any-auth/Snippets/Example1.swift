import AnyAuth

let client = SeedAnyAuthClient(token: "<token>")

private func main() async throws {
    try await client.user.get(

    )
}

try await main()
