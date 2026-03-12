using NUnit.Framework;
using SeedVersion.Test.Unit.MockServer;
using SeedVersion.Test.Utils;

namespace SeedVersion.Test.Unit.MockServer.User;

[TestFixture]
public class GetUserTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            {
              "id": "id",
              "name": "name"
            }
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/users/userId").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetUserAsync("userId");
        JsonAssert.AreEqual(response, mockResponse);
    }
}
