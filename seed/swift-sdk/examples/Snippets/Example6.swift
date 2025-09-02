import Foundation
import Examples

private func main() async throws {
    let client = ExamplesClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.file.service.getFile(
        filename: "filename",
        request: .init(
            filename: "filename",
            xFileApiVersion: "X-File-API-Version"
        )
    )
}

try await main()
