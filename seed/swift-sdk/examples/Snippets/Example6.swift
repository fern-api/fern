import Examples

let client = SeedExamplesClient(token: "<token>")

try await client.file.service.getFile(
    filename: "filename",
    request: .init(
        filename: "filename",
        xFileApiVersion: "X-File-API-Version"
    )
)
