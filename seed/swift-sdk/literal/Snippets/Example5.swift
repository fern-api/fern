import Literal

let client = SeedLiteralClient()

private func main() async throws {
    try await client.path.send(
        id: .123
    )
}

try await main()
