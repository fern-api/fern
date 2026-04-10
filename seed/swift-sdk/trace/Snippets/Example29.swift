import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.playlist.getplaylist(
        serviceParam: 1,
        playlistId: "playlistId"
    )
}

try await main()
