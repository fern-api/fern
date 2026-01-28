using NUnit.Framework;
using SeedUndiscriminatedUnions;
using SeedUndiscriminatedUnions.Core;

namespace SeedUndiscriminatedUnions.Test.Unit.MockServer;

[TestFixture]
public class GetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            "string"
            """;

        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Union.GetAsync("string");
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<MyUnion>(mockResponse)).UsingDefaults()
        );
    }
}
