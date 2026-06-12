import Foundation
import Trace

enum Example19 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.playlist.deletePlaylist(
            serviceParam: "1",
            playlistId: "playlist_id"
        )
    }
}
