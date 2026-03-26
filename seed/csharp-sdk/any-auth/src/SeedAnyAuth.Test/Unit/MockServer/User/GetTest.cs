using NUnit.Framework;
using SeedAnyAuth.Test.Unit.MockServer;
using SeedAnyAuth.Test.Utils;

namespace SeedAnyAuth.Test.Unit.MockServer.User;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetTest : BaseMockServerTest
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
                    .UsingPost()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.User.GetAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
