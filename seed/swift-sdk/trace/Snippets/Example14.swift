import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
    try await client.playlist.getPlaylist(
        serviceParam: 1,
        playlistId: "playlistId"
    )
}

try await main()
