using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedObjectsWithImports.Core;

namespace SeedObjectsWithImports.Test.Unit.MockServer;

[TestFixture]
public class SendOptionalBodyTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "string": {
                "key": "value"
              }
            }
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/send-optional-body")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Optional.SendOptionalBodyAsync(
            new Dictionary<string, object>()
            {
                {
                    "string",
                    new Dictionary<object, object?>() { { "key", "value" } }
                },
            },
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
