import Foundation
import Api

private func main() async throws {
    let client = ApiClient(
        baseURL: "https://api.fern.com",
        token: "<token>"
    )

    _ = try await client.playlist.createplaylist(
        serviceParam: 1,
        datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
        request: .init(body: PlaylistCreateRequest(
            name: "name",
            problems: [
                "problems"
            ]
        ))
    )
}

try await main()
