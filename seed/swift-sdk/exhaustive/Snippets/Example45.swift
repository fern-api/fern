import Exhaustive

let client = SeedExhaustiveClient(token: "<token>")

private func main() async throws {
    try await client.noAuth.postWithNoAuth(
        request: .object([
            "key": .string("value")
        ])
    )
}

try await main()
