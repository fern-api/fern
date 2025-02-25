using FluentAssertions.Json;
using global::System.Threading.Tasks;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedCustomAuth.Core;

namespace SeedCustomAuth.Test.Unit.MockServer;

[TestFixture]
public class PostWithCustomAuthTest : BaseMockServerTest
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
                    .WithPath("/custom-auth")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CustomAuth.PostWithCustomAuthAsync(
            new Dictionary<object, object?>() { { "key", "value" } },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
