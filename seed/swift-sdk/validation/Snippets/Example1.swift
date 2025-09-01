import Validation

let client = SeedValidationClient()

private func main() async throws {
    try await client.get(
        request: .init(
            decimal: 2.2,
            even: 100,
            name: "fern"
        )
    )
}

try await main()
