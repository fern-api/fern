import Foundation
import Testing
import Api

@Suite("TeamMemberClient Wire Tests") struct TeamMemberClientWireTests {
    @Test func updateTeamMember1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Foundation.Data(
                #"""
                {
                  "id": "id",
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """#.utf8
            )
        )
        let client = ApiClient(
            baseURL: "https://api.fern.com",
            urlSession: stub.urlSession
        )
        let expectedResponse = TeamMember(
            id: "id",
            givenName: Optional("given_name"),
            familyName: Optional("family_name")
        )
        let response = try await client.teamMember.updateTeamMember(
            teamMemberId: "team_member_id",
            request: .init(),
            requestOptions: RequestOptions(maxRetries: 0, additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}