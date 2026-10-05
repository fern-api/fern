import Foundation
import Testing
import Trace

@Suite("PlaylistClient Wire Tests") struct PlaylistClientWireTests {
    @Test func createPlaylist1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id",
                  "name": "name",
                  "problems": [
                    "problems",
                    "problems"
                  ]
                }
                """#.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Playlist(
            name: "name",
            problems: [
                "problems",
                "problems"
            ],
            playlistId: "playlist_id",
            ownerId: "owner-id"
        )
        let response = try await client.playlist.createPlaylist(
            serviceParam: "1",
            datetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            optionalDatetime: try! Date("2024-01-15T09:30:00Z", strategy: .iso8601),
            request: PlaylistCreateRequest(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getPlaylists1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
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
                """#.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = [
            Playlist(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ],
                playlistId: "playlist_id",
                ownerId: "owner-id"
            ),
            Playlist(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ],
                playlistId: "playlist_id",
                ownerId: "owner-id"
            )
        ]
        let response = try await client.playlist.getPlaylists(
            serviceParam: "1",
            limit: 1,
            otherField: "otherField",
            multiLineDocs: "multiLineDocs",
            optionalMultipleField: [
                "optionalMultipleField"
            ],
            multipleField: [
                "multipleField"
            ],
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getPlaylist1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id",
                  "name": "name",
                  "problems": [
                    "problems",
                    "problems"
                  ]
                }
                """#.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Playlist(
            name: "name",
            problems: [
                "problems",
                "problems"
            ],
            playlistId: "playlist_id",
            ownerId: "owner-id"
        )
        let response = try await client.playlist.getPlaylist(
            serviceParam: "1",
            playlistId: "playlistId",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func getPlaylistThrowsPlaylistIdNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                {
                  "type": "playlistId",
                  "value": "string"
                }
                """#.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.playlist.getPlaylist(
                serviceParam: "1",
                playlistId: "playlistId",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected TraceError.httpError with status code 404")
        } catch TraceError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 404)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "type": "playlistId",
              "value": "string"
            }
            """#)
        }
    }

    @Test func getPlaylistThrowsUnauthorizedError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 401,
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.playlist.getPlaylist(
                serviceParam: "1",
                playlistId: "playlistId",
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected TraceError.httpError with status code 401")
        } catch TraceError.httpError(let httpError) {
            #expect(httpError.statusCode == 401)
            #expect(httpError.body == nil)
        }
    }

    @Test func updatePlaylist1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "playlist_id": "playlist_id",
                  "owner-id": "owner-id",
                  "name": "name",
                  "problems": [
                    "problems",
                    "problems"
                  ]
                }
                """#.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        let expectedResponse = Optional(Playlist(
            name: "name",
            problems: [
                "problems",
                "problems"
            ],
            playlistId: "playlist_id",
            ownerId: "owner-id"
        ))
        let response = try await client.playlist.updatePlaylist(
            serviceParam: "1",
            playlistId: "playlistId",
            request: UpdatePlaylistRequest(
                name: "name",
                problems: [
                    "problems",
                    "problems"
                ]
            ),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updatePlaylistThrowsPlaylistIdNotFoundError() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            statusCode: 404,
            body: Foundation.Data(
                #"""
                {
                  "type": "playlistId",
                  "value": "string"
                }
                """#.utf8
            )
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        do {
            _ = try await client.playlist.updatePlaylist(
                serviceParam: "1",
                playlistId: "playlistId",
                request: UpdatePlaylistRequest(
                    name: "name",
                    problems: [
                        "problems",
                        "problems"
                    ]
                ),
                requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
            )
            Issue.record("Expected TraceError.httpError with status code 404")
        } catch TraceError.httpError(let httpError) {
            #expect(httpError.statusCode == 404)
            let body = try #require(httpError.body)
            #expect(body.code == 404)
            #expect(body.type == nil)
            #expect(body.message == #"""
            {
              "type": "playlistId",
              "value": "string"
            }
            """#)
        }
    }

    @Test func deletePlaylist1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data()
        )
        let client = TraceClient(
            baseURL: "https://api.fern.com",
            token: "<token>",
            urlSession: stub.urlSession
        )
        try await client.playlist.deletePlaylist(
            serviceParam: "1",
            playlistId: "playlist_id",
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
    }
}