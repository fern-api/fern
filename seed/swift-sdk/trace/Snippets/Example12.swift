import Foundation
import Trace

private func main() async throws {
    let client = TraceClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    try await client.playlist.createPlaylist(
        serviceParam: 1,
        request: .init(
            serviceParam: 1,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            optionalDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
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
