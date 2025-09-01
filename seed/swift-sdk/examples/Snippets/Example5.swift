import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.file.service.getFile(
    filename: "file.txt",
    request: .init(
        filename: "file.txt",
        xFileApiVersion: "0.0.2"
    )
)
