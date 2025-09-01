import UnknownAsAny

let client = SeedUnknownAsAnyClient()

private func main() async throws {
    try await client.unknown.post(
        request: .object([
            "key": .string("value")
        ])
    )
}

try await main()
