import Foundation
import Trace

private func main() async throws {
    let client = SeedTraceClient(token: "<token>")

    try await client.playlist.createPlaylist(
        serviceParam: 1,
        request: .init(
            serviceParam: 1,
            datetime: Date(timeIntervalSince1970: 1705311000),
            optionalDatetime: Date(timeIntervalSince1970: 1705311000),
            body: PlaylistCreateRequest(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            )
        )
    )
}

try await main()
