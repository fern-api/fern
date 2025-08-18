using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Container;

[NUnit.Framework.TestFixture]
public class GetAndReturnMapPrimToPrimTest : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "string": "string"
            }
            """;

        const string mockResponse = """
            {
              "string": "string"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-prim")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Container.GetAndReturnMapPrimToPrimAsync(
            new Dictionary<string, string>() { { "string", "string" } }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<Dictionary<string, string>>(
                        mockResponse
                    )
                )
                .UsingDefaults()
        );
    }
}
