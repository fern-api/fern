using NUnit.Framework;
using SeedExhaustive.Core;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[TestFixture]
public class GetWithPathTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/params/path/param").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.GetWithPathAsync("param");
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
