using NUnit.Framework;
using SeedErrors;
using SeedErrors.Core;

namespace SeedErrors.Test.Unit.MockServer;

[TestFixture]
public class FooWithExamplesTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
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
                    .WithPath("/foo3")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Simple.FooWithExamplesAsync(new FooRequest { Bar = "bar" });
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<FooResponse>(mockResponse)).UsingDefaults()
        );
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string requestJson = """
            {
              "bar": "hello"
            }
            """;

        const string mockResponse = """
            {
              "bar": "hello"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/foo3")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Simple.FooWithExamplesAsync(new FooRequest { Bar = "hello" });
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<FooResponse>(mockResponse)).UsingDefaults()
        );
    }
}
