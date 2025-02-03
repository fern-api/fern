using NUnit.Framework;

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class StopExecutionSessionTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/sessions/stop/sessionId")
                    .UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Submission.StopExecutionSessionAsync("sessionId", RequestOptions)
        );
    }
}
