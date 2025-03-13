using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnUuidTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
            """;

        const string mockResponse = """
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/uuid")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnUuidAsync(
            "d5e9c84f-c2b2-4bf4-b4b0-7ffd7a9ffc32",
            RequestOptions
        );
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<string>(mockResponse)));
    }
}
