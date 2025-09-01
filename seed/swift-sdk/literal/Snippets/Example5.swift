import Literal

private func main() async throws {
    let client = SeedLiteralClient()

    try await client.path.send(id: .123)
}

try await main()
