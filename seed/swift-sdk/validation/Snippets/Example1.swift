import Validation

private func main() async throws {
    let client = SeedValidationClient()

    try await client.get(request: .init(
        decimal: 2.2,
        even: 100,
        name: "fern"
    ))
}

try await main()
