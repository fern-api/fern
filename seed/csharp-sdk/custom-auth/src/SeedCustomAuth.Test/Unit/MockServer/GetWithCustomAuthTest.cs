using NUnit.Framework;
using SeedCustomAuth.Core;

namespace SeedCustomAuth.Test.Unit.MockServer;

[TestFixture]
public class GetWithCustomAuthTest : BaseMockServerTest
{
    [Test]
    public async Task MockServerTest()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/custom-auth").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.CustomAuth.GetWithCustomAuthAsync();
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
