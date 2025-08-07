using NUnit.Framework;
using SeedContentTypes;

namespace SeedContentTypes.Test.Unit.MockServer;

[TestFixture]
public class PatchComplexTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "name": "name",
              "email": "email",
              "age": 1,
              "active": true,
              "metadata": {
                "metadata": {
                  "key": "value"
                }
              },
              "tags": [
                "tags",
                "tags"
              ]
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/complex/id")
                    .WithHeader("Content-Type", "application/merge-patch+json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.PatchComplexAsync(
                "id",
                new PatchComplexRequest
                {
                    Name = "name",
                    Email = "email",
                    Age = 1,
                    Active = true,
                    Metadata = new Dictionary<string, object>()
                    {
                        {
                            "metadata",
                            new Dictionary<object, object?>() { { "key", "value" } }
                        },
                    },
                    Tags = new List<string>() { "tags", "tags" },
                }
            )
        );
    }
}
