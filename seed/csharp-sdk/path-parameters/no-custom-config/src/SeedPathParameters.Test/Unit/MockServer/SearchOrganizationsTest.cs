using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Core;

namespace SeedPathParameters.Test.Unit.MockServer;

[TestFixture]
public class SearchOrganizationsTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "name": "name",
                "tags": [
                  "tags",
                  "tags"
                ]
              },
              {
                "name": "name",
                "tags": [
                  "tags",
                  "tags"
                ]
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/tenant_id/organizations/organization_id/search")
                    .WithParam("limit", "1")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Organizations.SearchOrganizationsAsync(
            "tenant_id",
            "organization_id",
            new SearchOrganizationsRequest { Limit = 1 },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<Organization>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
