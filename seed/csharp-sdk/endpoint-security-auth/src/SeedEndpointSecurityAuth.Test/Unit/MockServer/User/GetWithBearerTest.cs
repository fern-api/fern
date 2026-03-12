using NUnit.Framework;
using SeedEndpointSecurityAuth.Test.Unit.MockServer;
using SeedEndpointSecurityAuth.Test.Utils;

namespace SeedEndpointSecurityAuth.Test.Unit.MockServer.User;

[TestFixture]
public class GetWithBearerTest : BaseMockServerTest
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
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetWithBearerAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
