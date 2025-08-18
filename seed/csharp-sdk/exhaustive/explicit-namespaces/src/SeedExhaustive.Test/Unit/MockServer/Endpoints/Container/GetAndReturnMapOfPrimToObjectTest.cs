using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Container;

[NUnit.Framework.TestFixture]
public class GetAndReturnMapOfPrimToObjectTest
    : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            {
              "string": {
                "string": "string"
              }
            }
            """;

        const string mockResponse = """
            {
              "string": {
                "string": "string"
              }
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/map-prim-to-object")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Container.GetAndReturnMapOfPrimToObjectAsync(
            new Dictionary<string, SeedExhaustive.Types.Object.ObjectWithRequiredField>()
            {
                {
                    "string",
                    new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" }
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<
                        Dictionary<string, SeedExhaustive.Types.Object.ObjectWithRequiredField>
                    >(mockResponse)
                )
                .UsingDefaults()
        );
    }
}
