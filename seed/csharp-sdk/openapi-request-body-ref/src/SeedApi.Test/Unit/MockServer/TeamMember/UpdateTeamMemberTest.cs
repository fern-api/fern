using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.TeamMember;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class UpdateTeamMemberTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string requestJson = """
            {
              "given_name": "given_name",
              "family_name": "family_name",
              "email_address": "email_address"
            }
            """;

        const string mockResponse = """
            {
              "id": "id",
              "given_name": "given_name",
              "family_name": "family_name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/team-members/team_member_id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.TeamMember.UpdateTeamMemberAsync(
            new UpdateTeamMemberRequest
            {
                TeamMemberId = "team_member_id",
                GivenName = "given_name",
                FamilyName = "family_name",
                EmailAddress = "email_address",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {}
            """;

        const string mockResponse = """
            {
              "id": "id",
              "given_name": "given_name",
              "family_name": "family_name"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/team-members/team_member_id")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPut()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.TeamMember.UpdateTeamMemberAsync(
            new UpdateTeamMemberRequest { TeamMemberId = "team_member_id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
