using NUnit.Framework;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Test.Unit.MockServer;
using SeedUndiscriminatedUnions.Test.Utils;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer.Union;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithBasePropertiesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "value": {
                "value": {
                  "key": "value"
                }
              }
            }
            """;

        const string mockResponse = """
            {
              "name": "name",
              "value": {
                "value": {
                  "key": "value"
                }
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/with-base-properties")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetWithBasePropertiesAsync(
            new NamedMetadata
            {
                Name = "name",
                Value = new Dictionary<string, object?>()
                {
                    {
                        "value",
                        new Dictionary<object, object?>() { { "key", "value" } }
                    },
                },
            }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
