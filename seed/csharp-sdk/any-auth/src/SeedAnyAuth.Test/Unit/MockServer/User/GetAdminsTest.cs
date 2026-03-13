using NUnit.Framework;
using SeedAnyAuth.Test.Unit.MockServer;
using SeedAnyAuth.Test.Utils;

namespace SeedAnyAuth.Test.Unit.MockServer.User;

[TestFixture]
public class GetAdminsTest : BaseMockServerTest
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
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/admins").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetAdminsAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
