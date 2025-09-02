import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.playlist.updatePlaylist(
        serviceParam: 1,
        playlistId: "playlistId",
        request: UpdatePlaylistRequest(
            name: "name",
            problems: [
                "problems",
                "problems"
            ]
        )
    )
}

try await main()
