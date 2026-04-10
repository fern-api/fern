using NUnit.Framework;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.FolderService;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class FolderServiceUnknownRequestTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            {
              "key": "value"
            }
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/service")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.FolderService.FolderServiceUnknownRequestAsync(
                new Dictionary<object, object?>() { { "key", "value" } }
            )
        );
    }
}
