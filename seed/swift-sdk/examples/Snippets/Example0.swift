import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.echo(
        request: "Hello world!\n\nwith\n\tnewlines"
    )
}

try await main()
