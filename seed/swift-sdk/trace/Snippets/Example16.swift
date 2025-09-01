import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.playlist.deletePlaylist(
        serviceParam: 1,
        playlistId: "playlist_id"
    )
}

try await main()
