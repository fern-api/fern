import Examples

let client = SeedExamplesClient(token: "<token>")

private func main() async throws {
    try await client.file.service.getFile(
        filename: "file.txt",
        request: .init(
            filename: "file.txt",
            xFileApiVersion: "0.0.2"
        )
    )
}

try await main()
