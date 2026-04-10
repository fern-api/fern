using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Organizations;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetorganizationuserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "name": "name",
              "tags": [
                "tags",
                "tags"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/tenant_id/organizations/organization_id/users/user_id")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Organizations.GetorganizationuserAsync(
            new OrganizationsGetOrganizationUserRequest
            {
                TenantId = "tenant_id",
                OrganizationId = "organization_id",
                UserId = "user_id",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "name": "name",
              "tags": [
                "tags"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/tenant_id/organizations/organization_id/users/user_id")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Organizations.GetorganizationuserAsync(
            new OrganizationsGetOrganizationUserRequest
            {
                TenantId = "tenant_id",
                OrganizationId = "organization_id",
                UserId = "user_id",
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
