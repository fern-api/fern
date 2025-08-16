using NUnit.Framework;
using SeedContentTypes;

namespace SeedContentTypes.Test.Unit.MockServer;

[TestFixture]
public class NamedPatchWithMixedTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "appId": "appId",
              "instructions": "instructions",
              "active": true
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/named-mixed/id")
                    .WithHeader("Content-Type", "application/merge-patch+json")
                    .UsingPatch()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.NamedPatchWithMixedAsync(
                "id",
                new NamedMixedPatchRequest
                {
                    AppId = "appId",
                    Instructions = "instructions",
                    Active = true,
                }
            )
        );
    }
}
