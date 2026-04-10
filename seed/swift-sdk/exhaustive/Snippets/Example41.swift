import Foundation
import Exhaustive

private func main() async throws {
    let client = ExhaustiveClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.endpoints.params.uploadWithPath(
        param: "upload-path",
        request: Data("data".utf8)
    )
}

try await main()
