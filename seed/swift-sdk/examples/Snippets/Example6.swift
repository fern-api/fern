import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.file.service.getFile(
        filename: "filename",
        request: .init(
            filename: "filename",
            xFileApiVersion: "X-File-API-Version"
        )
    )
}

try await main()
