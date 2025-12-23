using NUnit.Framework;
using SeedEndpointSecurityAuth;
using SeedEndpointSecurityAuth.Core;

namespace SeedEndpointSecurityAuth.Test.Unit.MockServer;

[TestFixture]
public class GetWithAnyAuthTest : BaseMockServerTest
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

        var response = await Client.User.GetWithAnyAuthAsync();
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<User>>(mockResponse)).UsingDefaults()
        );
    }
}
