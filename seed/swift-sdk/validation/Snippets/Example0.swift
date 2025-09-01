import Validation

private func main() async throws {
    let client = SeedValidationClient()

    try await client.create(request: .init(
        decimal: 2.2,
        even: 100,
        name: "fern",
        shape: .square
    ))
}

try await main()
