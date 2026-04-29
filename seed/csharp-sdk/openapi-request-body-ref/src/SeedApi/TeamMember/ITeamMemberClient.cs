namespace SeedApi;

public partial interface ITeamMemberClient
{
    WithRawResponseTask<TeamMember> UpdateTeamMemberAsync(
        UpdateTeamMemberRequest request,
        RequestOptions? options = null,
        CancellationToken cancellationToken = default
    );
}
