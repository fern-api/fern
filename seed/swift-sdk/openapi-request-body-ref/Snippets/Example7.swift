import Foundation
import Api

private func main() async throws {
    let client = ApiClient(baseURL: "https://api.fern.com")

    _ = try await client.teamMember.updateTeamMember(
        teamMemberId: "team_member_id",
        request: .init()
    )
}

try await main()
