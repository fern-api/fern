using global::System.Threading.Tasks;
using NUnit.Framework;
using SeedBasicAuthEnvironmentVariables.Core;

namespace SeedBasicAuthEnvironmentVariables.Test.Unit.MockServer;

[TestFixture]
public class GetWithBasicAuthTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/basic-auth").UsingGet())
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.BasicAuth.GetWithBasicAuthAsync(RequestOptions);
        Assert.That(response, Is.EqualTo(JsonUtils.Deserialize<bool>(mockResponse)));
    }
}
