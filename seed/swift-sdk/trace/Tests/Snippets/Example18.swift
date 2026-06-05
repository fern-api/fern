import Foundation
import Trace

enum Example18 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.playlist.updatePlaylist(
            serviceParam: "1",
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
}
