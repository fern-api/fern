using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnSetOfPrimitivesTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            [
              "string"
            ]
            """;

        const string mockResponse = """
            [
              "string"
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/container/set-of-primitives")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Container.GetAndReturnSetOfPrimitivesAsync(
            new HashSet<string>() { "string" },
            RequestOptions
        );
        Assert.That(
            response,
            Is.EqualTo(JsonUtils.Deserialize<HashSet<string>>(mockResponse))
                .UsingPropertiesComparer()
        );
    }
}
