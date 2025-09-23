import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.file.service.getFile(
        filename: "file.txt",
        request: .init(
            filename: "file.txt",
            xFileApiVersion: "0.0.2"
        )
    )
}

try await main()
