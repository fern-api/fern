using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Params;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetWithInlinePathTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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

        var response = await Client.Endpoints.Params.GetWithInlinePathAsync(
            "param",
            new GetWithInlinePath(),
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
