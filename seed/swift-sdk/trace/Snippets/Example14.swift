import Trace

let client = SeedTraceClient(token: "<token>")

try await client.playlist.getPlaylist(
    serviceParam: 1,
    playlistId: "playlistId"
)
