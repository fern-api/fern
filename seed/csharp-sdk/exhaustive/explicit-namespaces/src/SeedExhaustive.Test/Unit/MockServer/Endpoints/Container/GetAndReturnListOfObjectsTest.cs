using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Test.Unit.MockServer;
using SeedExhaustive.Types.Object;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Container;

[NUnit.Framework.TestFixture]
public class GetAndReturnListOfObjectsTest : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            [
              {
                "string": "string"
              },
              {
                "string": "string"
              }
            ]
            """;

        const string mockResponse = """
            [
              {
                "string": "string"
              },
              {
                "string": "string"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/list-of-objects")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Container.GetAndReturnListOfObjectsAsync(
            new List<SeedExhaustive.Types.Object.ObjectWithRequiredField>()
            {
                new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" },
                new SeedExhaustive.Types.Object.ObjectWithRequiredField { String = "string" },
            }
        );
        Assert.That(
            response,
            Is.EqualTo(
                    SeedExhaustive.Core.JsonUtils.Deserialize<
                        IEnumerable<SeedExhaustive.Types.Object.ObjectWithRequiredField>
                    >(mockResponse)
                )
                .UsingDefaults()
        );
    }
}
