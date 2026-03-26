using NUnit.Framework;
using SeedEndpointSecurityAuth.Test.Unit.MockServer;
using SeedEndpointSecurityAuth.Test.Utils;

namespace SeedEndpointSecurityAuth.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithAllAuthTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            [
              {
                "id": "id",
                "name": "name"
              },
              {
                "id": "id",
                "name": "name"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/users")
                    .WithHeader("Authorization", "Bearer TOKEN")
                    .WithHeader("X-API-Key", "API_KEY")
                    .WithHeader("Authorization", "Basic VVNFUk5BTUU6UEFTU1dPUkQ=")
                    .UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetWithAllAuthAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
