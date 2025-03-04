using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Core;

namespace SeedUnknownAsAny.Test.Unit.MockServer;

[TestFixture]
public class PostObjectTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "unknown": {
                "key": "value"
              }
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

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/with-object")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Unknown.PostObjectAsync(
            new MyObject { Unknown = new Dictionary<object, object?>() { { "key", "value" } } },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<object>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
