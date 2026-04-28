import Foundation
import Testing
import Api

@Suite("TeamMemberClient Wire Tests") struct TeamMemberClientWireTests {
    @Test func updateTeamMember1() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
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
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }

    @Test func updateTeamMember2() async throws -> Void {
        let stub = HTTPStub()
        stub.setResponse(
            body: Data(
                """
                {
                  "id": "id",
                  "given_name": "given_name",
                  "family_name": "family_name"
                }
                """.utf8
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
            request: .init(
                givenName: "given_name",
                familyName: "family_name",
                emailAddress: "email_address"
            ),
            requestOptions: RequestOptions(additionalHeaders: stub.headers)
        )
        try #require(response == expectedResponse)
    }
}