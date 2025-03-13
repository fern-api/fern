using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedBasicAuthEnvironmentVariables.Core;

namespace SeedBasicAuthEnvironmentVariables.Test.Unit.MockServer;

[TestFixture]
public class PostWithBasicAuthTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
                    .WithPath("/basic-auth")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.BasicAuth.PostWithBasicAuthAsync(
            new Dictionary<object, object?>() { { "key", "value" } },
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
