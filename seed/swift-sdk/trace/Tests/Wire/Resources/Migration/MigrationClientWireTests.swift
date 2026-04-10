import Foundation
import Testing
import Api

@Suite("MigrationClient Wire Tests") struct MigrationClientWireTests {
    @Test func getattemptedmigrations1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "name": "name",
                    "status": "RUNNING"
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
            Migration(
                name: "name",
                status: .running
            )
        ]
        let response = try await client.migration.getattemptedmigrations(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }

    @Test func getattemptedmigrations2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                [
                  {
                    "name": "name",
                    "status": "RUNNING"
                  },
                  {
                    "name": "name",
                    "status": "RUNNING"
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
            Migration(
                name: "name",
                status: .running
            ),
            Migration(
                name: "name",
                status: .running
            )
        ]
        let response = try await client.migration.getattemptedmigrations(requestOptions: RequestOptions(additionalHeaders: stub.headers))
        try #require(response == expectedResponse)
    }
}