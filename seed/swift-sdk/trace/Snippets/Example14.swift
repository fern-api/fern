import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.playlist.getPlaylist(
        serviceParam: 1,
        playlistId: "playlistId"
    )
}

try await main()
