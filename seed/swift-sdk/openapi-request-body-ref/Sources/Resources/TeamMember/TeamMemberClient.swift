import Foundation

public final class TeamMemberClient: Sendable {
    private let httpClient: HTTPClient

    init(config: ClientConfig) {
        self.httpClient = HTTPClient(config: config)
    }

    /// ```swift
    /// import Foundation
    /// import Api
    /// 
    /// private func main() async throws {
    ///     let client = ApiClient()
    /// 
    ///     _ = try await client.teamMember.updateTeamMember(
    ///         teamMemberId: "team_member_id",
    ///         request: .init()
    ///     )
    /// }
    /// 
    /// try await main()
    /// ```
    ///
    /// - Parameter requestOptions: Additional options for configuring the request, such as custom headers or timeout settings.
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