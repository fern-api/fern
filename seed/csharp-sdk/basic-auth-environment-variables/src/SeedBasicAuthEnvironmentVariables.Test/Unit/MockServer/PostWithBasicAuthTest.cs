using NUnit.Framework;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedBasicAuthEnvironmentVariables.Core;

    namespace SeedBasicAuthEnvironmentVariables.Test.Unit.MockServer;

[TestFixture]
public class PostWithBasicAuthTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        {
          "key": "value"
        }
        """;

        const string mockResponse = """
        true
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/basic-auth").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.BasicAuth.PostWithBasicAuthAsync(new Dictionary<object, object?>() {
                { "key", "value" }, 
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
