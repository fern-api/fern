using NUnit.Framework;

namespace SeedContentTypes.Test.Unit.MockServer;

[TestFixture]
public class PatchTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "application": "application",
              "require_auth": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithHeader("Content-Type", "application/merge-patch+json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.PatchAsync(
                new PatchProxyRequest { Application = "application", RequireAuth = true }
            )
        );
    }
}
