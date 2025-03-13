using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedPathParameters;
using SeedPathParameters.Core;

namespace SeedPathParameters.Test.Unit.MockServer;

[TestFixture]
public class GetOrganizationTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
                    .WithPath("/tenant_id/organizations/organization_id/")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Organizations.GetOrganizationAsync(
            "tenant_id",
            "organization_id",
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<Organization>(mockResponse)).UsingPropertiesComparer()
        );
    }
}
