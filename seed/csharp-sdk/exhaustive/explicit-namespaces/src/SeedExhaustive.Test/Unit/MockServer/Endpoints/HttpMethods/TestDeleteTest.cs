using NUnit.Framework;
using SeedExhaustive.Core;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.HttpMethods;

[TestFixture]
public class TestDeleteTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/http-methods/id").UsingDelete()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Endpoints.HttpMethods.TestDeleteAsync("id");
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
