using NUnit.Framework;
using SeedErrors;
using SeedErrors.Core;

namespace SeedErrors.Test.Unit.MockServer;

[TestFixture]
public class FooTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            {
              "bar": "bar"
            }
            """;

        const string mockResponse = """
            {
              "bar": "bar"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo2")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Simple.FooAsync(new FooRequest { Bar = "bar" });
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<FooResponse>(mockResponse)).UsingDefaults()
        );
    }
}
