import Examples

private func main() async throws {
    let client = SeedExamplesClient(token: "<token>")

    try await client.echo(request: "primitive")
}

try await main()
