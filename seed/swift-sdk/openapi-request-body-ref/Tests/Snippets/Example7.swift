import Foundation
import Api

enum Example7 {
    static func snippet() async throws {
        let client = ApiClient(baseURL: "https://api.fern.com")

        _ = try await client.teamMember.updateTeamMember(
            teamMemberId: "team_member_id",
            request: .init()
        )
    }
}
