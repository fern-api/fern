using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Noauth;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostwithnoauthTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/no-auth")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Noauth.PostwithnoauthAsync(
            new Dictionary<object, object?>() { { "key", "value" } }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
