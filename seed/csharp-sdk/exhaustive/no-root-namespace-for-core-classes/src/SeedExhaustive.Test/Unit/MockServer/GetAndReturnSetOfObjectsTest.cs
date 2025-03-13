using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;
using SeedExhaustive.Types;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnSetOfObjectsTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            [
              {
                "string": "string"
              }
            ]
            """;

        const string mockResponse = """
            [
              {
                "string": "string"
              }
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/set-of-objects")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Container.GetAndReturnSetOfObjectsAsync(
            new HashSet<ObjectWithRequiredField>()
            {
                new ObjectWithRequiredField { String = "string" },
            },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<HashSet<ObjectWithRequiredField>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
