using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnListOfObjectsTest : BaseMockServerTest
{
    [Test]
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
            new List<ObjectWithRequiredField>()
            {
                new ObjectWithRequiredField { String = "string" },
                new ObjectWithRequiredField { String = "string" },
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<IEnumerable<ObjectWithRequiredField>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
