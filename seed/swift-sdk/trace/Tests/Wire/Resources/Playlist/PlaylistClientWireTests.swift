import Foundation
import Testing
import Trace

@Suite("PlaylistClient Wire Tests") struct PlaylistClientWireTests {
    @Test func createPlaylist1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id",
                  "name": "name",
                  "problems": [
                    "problems",
                    "problems"
                  ]
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Playlist(
            playlistId: "playlist_id",
            ownerId: "owner-id",
            name: "name",
            problems: [
                "problems",
                "problems"
            ]
        )
        let response = try await client.playlist.createPlaylist(
            serviceParam: 1,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            optionalDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            request: .init(body: PlaylistCreateRequest(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            ))
        )
        try #require(response == expectedResponse)
    }

    @Test func getPlaylists1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "playlist_id": "playlist_id",
                    "owner-id": "owner-id",
                    "name": "name",
                    "problems": [
                      "problems",
                      "problems"
                    ]
                  },
                  {
                    "playlist_id": "playlist_id",
                    "owner-id": "owner-id",
                    "name": "name",
                    "problems": [
                      "problems",
                      "problems"
                    ]
                  }
                ]
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Playlist(
                playlistId: "playlist_id",
                ownerId: "owner-id",
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            ),
            Playlist(
                playlistId: "playlist_id",
                ownerId: "owner-id",
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            )
        ]
        let response = try await client.playlist.getPlaylists(
            serviceParam: 1,
            limit: 1,
            otherField: "otherField",
            multiLineDocs: "multiLineDocs"
        )
        try #require(response == expectedResponse)
    }

    @Test func getPlaylist1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id",
                  "name": "name",
                  "problems": [
                    "problems",
                    "problems"
                  ]
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Playlist(
            playlistId: "playlist_id",
            ownerId: "owner-id",
            name: "name",
            problems: [
                "problems",
                "problems"
            ]
        )
        let response = try await client.playlist.getPlaylist(
            serviceParam: 1,
            playlistId: "playlistId"
        )
        try #require(response == expectedResponse)
    }

    @Test func updatePlaylist1() async throws -> Void {
        let stub = WireStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id",
                  "name": "name",
                  "problems": [
                    "problems",
                    "problems"
                  ]
                }
                """.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(Playlist(
            playlistId: "playlist_id",
            ownerId: "owner-id",
            name: "name",
            problems: [
                "problems",
                "problems"
            ]
        ))
        let response = try await client.playlist.updatePlaylist(
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
        try #require(response == expectedResponse)
    }
}