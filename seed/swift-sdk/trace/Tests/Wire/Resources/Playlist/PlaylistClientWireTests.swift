import Foundation
import Testing
import Api

@Suite("PlaylistClient Wire Tests") struct PlaylistClientWireTests {
    @Test func createplaylist1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "problems": [
                    "problems"
                  ],
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Playlist(
            name: "name",
            problems: [
                "problems"
            ],
            playlistId: "playlist_id",
            ownerId: "owner-id"
        )
        let response = try await client.playlist.createplaylist(
            serviceParam: 1,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            request: .init(body: PlaylistCreateRequest(
                name: "name",
                problems: [
                    "problems"
                ]
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func createplaylist2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
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
        let response = try await client.playlist.createplaylist(
            serviceParam: 1,
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            optionalDatetime: .value(try! Date("2024-01-15T09:30:00Z", strategy: .iso8601)),
            request: .init(body: PlaylistCreateRequest(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            )),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getplaylists1() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
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
        let response = try await client.playlist.getplaylists(
            serviceParam: 1,
            limit: .value(1),
            otherField: "otherField",
            multiLineDocs: "multiLineDocs",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getplaylist1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "problems": [
                    "problems"
                  ],
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Playlist(
            name: "name",
            problems: [
                "problems"
            ],
            playlistId: "playlist_id",
            ownerId: "owner-id"
        )
        let response = try await client.playlist.getplaylist(
            serviceParam: 1,
            playlistId: "playlistId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getplaylist2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
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
        let response = try await client.playlist.getplaylist(
            serviceParam: 1,
            playlistId: "playlistId",
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateplaylist1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "name": "name",
                  "problems": [
                    "problems"
                  ],
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id"
                }
                """.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Playlist(
            name: "name",
            problems: [
                "problems"
            ],
            playlistId: "playlist_id",
            ownerId: "owner-id"
        )
        let response = try await client.playlist.updateplaylist(
            serviceParam: 1,
            playlistId: "playlistId",
            request: .init(
                name: "name",
                problems: [
                    "problems"
                ]
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateplaylist2() async throws -> Void {
        let stub = HTTPStub()
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
        let client = ApiClient(
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
        let response = try await client.playlist.updateplaylist(
            serviceParam: 1,
            playlistId: "playlistId",
            request: .init(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}