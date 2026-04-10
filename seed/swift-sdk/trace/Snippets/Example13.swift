import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.playlist.getPlaylists(
        serviceParam: 1,
        limit: 1,
        otherField: "otherField",
        multiLineDocs: "multiLineDocs"
    )
}

try await main()
