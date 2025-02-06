using NUnit.Framework;
using System.Threading.Tasks;
using FluentAssertions.Json;
using Newtonsoft.Json.Linq;
using SeedUnknownAsAny.Core;

    namespace SeedUnknownAsAny.Test.Unit.MockServer;

[TestFixture]
public class PostTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest() {
        const string requestJson = """
        {
          "key": "value"
        }
        """;

        const string mockResponse = """
        [
          {
            "key": "value"
          },
          {
            "key": "value"
          }
        ]
        """;

        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        .WithBody(mockResponse));

        var response = await Client.Unknown.PostAsync(new Dictionary<object, object?>() {
                { "key", "value" }, 
            }, RequestOptions);
        JToken.Parse(mockResponse).Should().BeEquivalentTo(JToken.Parse(JsonUtils.Serialize(response)));
    }

}
