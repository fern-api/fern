import PlainText

private func main() async throws {
    let client = SeedPlainTextClient()

    try await client.service.getText()
}

try await main()
