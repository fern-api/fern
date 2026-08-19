using NUnit.Framework;
using SeedObjectsWithImports.Test.Unit.MockServer;
using SeedObjectsWithImports.Test.Utils;

namespace SeedObjectsWithImports.Test.Unit.MockServer.Optional;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SendOptionalBodyTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            new Dictionary<string, object?>()
            {
                {
                    "string",
                    new Dictionary<object, object?>() { { "key", "value" } }
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
