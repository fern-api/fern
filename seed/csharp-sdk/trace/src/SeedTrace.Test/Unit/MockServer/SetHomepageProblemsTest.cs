using NUnit.Framework;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class SetHomepageProblemsTest : BaseMockServerTest
{
    [Test]
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Homepage.SetHomepageProblemsAsync(
                    new List<string>() { "string", "string" },
                    RequestOptions
                )
        );
    }
}
