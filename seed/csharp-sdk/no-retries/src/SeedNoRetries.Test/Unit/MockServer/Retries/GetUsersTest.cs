using NUnit.Framework;
using SeedNoRetries.Test.Unit.MockServer;
using SeedNoRetries.Test.Utils;

namespace SeedNoRetries.Test.Unit.MockServer.Retries;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetUsersTest : BaseMockServerTest
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

        var response = await Client.Retries.GetUsersAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
