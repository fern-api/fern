import Trace

let client = SeedTraceClient(token: "<token>")

private func main() async throws {
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
