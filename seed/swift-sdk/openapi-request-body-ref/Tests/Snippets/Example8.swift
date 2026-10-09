import Foundation
import Api

enum Example8 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.teamMember.updateTeamMember(
            teamMemberId: "team_member_id",
            request: .init(
                givenName: "given_name",
                familyName: "family_name",
                emailAddress: "email_address"
            )
        )
    }
}
