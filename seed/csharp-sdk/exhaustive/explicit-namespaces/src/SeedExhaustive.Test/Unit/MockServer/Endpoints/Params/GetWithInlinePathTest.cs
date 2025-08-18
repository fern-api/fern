using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Test.Unit.MockServer;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[NUnit.Framework.TestFixture]
public class GetWithInlinePathTest : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
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
            new SeedExhaustive.Endpoints.Params.GetWithInlinePath { Param = "param" }
        );
        Assert.That(
            response,
            Is.EqualTo(SeedExhaustive.Core.JsonUtils.Deserialize<string>(mockResponse))
        );
    }
}
