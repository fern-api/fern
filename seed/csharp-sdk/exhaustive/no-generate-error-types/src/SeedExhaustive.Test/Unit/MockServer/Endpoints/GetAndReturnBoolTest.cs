using NUnit.Framework;
using SeedExhaustive.Core;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints;

[TestFixture]
public class GetAndReturnBoolTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string requestJson = """
            true
            """;

        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/primitive/boolean")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.Primitive.GetAndReturnBoolAsync(true);
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
