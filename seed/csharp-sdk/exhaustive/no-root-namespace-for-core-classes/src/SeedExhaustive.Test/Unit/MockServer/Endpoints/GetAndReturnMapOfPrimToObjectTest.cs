using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints;

[TestFixture]
public class GetAndReturnMapOfPrimToObjectTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest()
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
            new Dictionary<string, ObjectWithRequiredField>()
            {
                {
                    "string",
                    new ObjectWithRequiredField { String = "string" }
                },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    JsonUtils.Deserialize<Dictionary<string, ObjectWithRequiredField>>(mockResponse)
                )
                .UsingDefaults()
        );
    }
}
