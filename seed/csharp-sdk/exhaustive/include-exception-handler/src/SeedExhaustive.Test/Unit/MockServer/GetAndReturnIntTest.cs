using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedExhaustive.Core;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetAndReturnIntTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string requestJson = """
            1
            """;

        const string mockResponse = """
            1
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/integer")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnIntAsync(1, RequestOptions);
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<int>(mockResponse)));
    }
}
