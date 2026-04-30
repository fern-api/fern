import Foundation

public final class TeamMemberClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    public func updateTeamMember(teamMemberId: String, request: Requests.UpdateTeamMemberRequest, requestOptions: RequestOptions? = nil) async throws -> TeamMember {
        return try await httpClient.performRequest(
            method: .put,
            path: "/team-members/\(teamMemberId)",
            body: request,
            requestOptions: requestOptions,
            responseType: TeamMember.self
        )
    }
}