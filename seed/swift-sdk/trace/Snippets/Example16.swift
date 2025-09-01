import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.playlist.deletePlaylist(
        serviceParam: 1,
        playlistId: "playlist_id"
    )
}

try await main()
