import Foundation
import Testing
import Trace

@Suite("MigrationClient Wire Tests") struct MigrationClientWireTests {
    @Test func getAttemptedMigrations1() async throws -> Void {
        let stub = WireStub()
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
        let client = TraceClient(
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
        let response = try await client.migration.getAttemptedMigrations()
        try #require(response == expectedResponse)
    }
}