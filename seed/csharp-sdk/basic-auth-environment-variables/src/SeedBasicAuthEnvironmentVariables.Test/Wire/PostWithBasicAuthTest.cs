using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using NUnit.Framework;
using SeedBasicAuthEnvironmentVariables.Core;
using SeedBasicAuthEnvironmentVariables.Test.Wire;

#nullable enable

namespace SeedBasicAuthEnvironmentVariables.Test;

[TestFixture]
public class PostWithBasicAuthTest : BaseWireTest
{
    [Test]
    public async Task WireTest()
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
            new Dictionary<object, object?>() { { "key", "value" }, },
            RequestOptions
        );
        JToken
            .Parse(mockResponse)
            .Should()
            .BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }
}
