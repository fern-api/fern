import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.echo(
        request: "string"
    )
}

try await main()
