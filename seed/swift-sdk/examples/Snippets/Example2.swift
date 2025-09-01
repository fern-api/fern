import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.echo(
    request: "primitive"
)
