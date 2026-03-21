using NUnit.Framework;
using SeedUnknownAsAny;
using SeedUnknownAsAny.Test.Unit.MockServer;
using SeedUnknownAsAny.Test.Utils;

namespace SeedUnknownAsAny.Test.Unit.MockServer.Unknown;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostObjectTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            new MyObject { Unknown = new Dictionary<object, object?>() { { "key", "value" } } }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
