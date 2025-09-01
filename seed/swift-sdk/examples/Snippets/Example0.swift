import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.echo(
    request: "Hello world!\n\nwith\n\tnewlines"
)
