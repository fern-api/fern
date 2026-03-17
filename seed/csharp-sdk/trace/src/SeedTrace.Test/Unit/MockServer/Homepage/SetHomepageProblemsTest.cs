using NUnit.Framework;
using SeedTrace.Test_.Unit.MockServer;

namespace SeedTrace.Test_.Unit.MockServer.Homepage;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class SetHomepageProblemsTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        const string requestJson = """
            [
              "string",
              "string"
            ]
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/homepage-problems")
                    .UsingPost()
                    .WithBodyAsJson(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Homepage.SetHomepageProblemsAsync(
                new List<string>() { "string", "string" }
            )
        );
    }
}
