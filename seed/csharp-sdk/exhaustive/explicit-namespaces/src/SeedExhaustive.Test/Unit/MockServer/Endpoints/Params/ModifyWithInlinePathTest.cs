using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Test.Unit.MockServer;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[NUnit.Framework.TestFixture]
public class ModifyWithInlinePathTest : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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
                    .WithPath("/params/path/param")
                    .UsingPut()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Params.ModifyWithInlinePathAsync(
            new SeedExhaustive.Endpoints.Params.ModifyResourceAtInlinedPath
            {
                Param = "param",
                Body = "string",
            }
        );
        Assert.That(
            response,
            Is.EqualTo(SeedExhaustive.Core.JsonUtils.Deserialize<string>(mockResponse))
        );
    }
}
