import Foundation
import Trace

enum Example15 {
    static func snippet() async throws {
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>"
        )

        _ = try await client.playlist.getPlaylist(
            serviceParam: 1,
            playlistId: "playlistId"
        )
    }
}
