using SeedApi;

public partial class Examples
{
    public async Task Example8() {
        var client = new SeedApiClient(
            clientOptions: new ClientOptions {
                BaseUrl = "https://api.fern.com"
            }
        );

        await client.TeamMember.UpdateTeamMemberAsync(
            new UpdateTeamMemberRequest {
                TeamMemberId = "team_member_id",
                GivenName = "given_name",
                FamilyName = "family_name",
                EmailAddress = "email_address"
            }
        );
    }

}
