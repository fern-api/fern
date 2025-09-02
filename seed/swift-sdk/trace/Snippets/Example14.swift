import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(token: "<token>")

    try await client.playlist.getPlaylist(
        serviceParam: 1,
        playlistId: "playlistId"
    )
}

try await main()
