using NUnit.Framework;
using SeedPathParameters.Test.Unit.MockServer;
using SeedPathParameters.Test.Utils;

namespace SeedPathParameters.Test.Unit.MockServer.Organizations;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetOrganizationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            "organization_id"
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
