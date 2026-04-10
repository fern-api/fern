import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.playlist.updateplaylist(
        serviceParam: 1,
        playlistId: "playlistId",
        request: .init(
            name: "name",
            problems: [
                "problems",
                "problems"
            ]
        )
    )
}

try await main()
