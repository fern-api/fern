import Validation

let client = SeedValidationClient()

private func main() async throws {
    try await client.create(
        request: .init(
            decimal: 2.2,
            even: 100,
            name: "fern",
            shape: .square
        )
    )
}

try await main()
