using NUnit.Framework;

#nullable enable

namespace SeedTrace.Test.Unit.MockServer;

[TestFixture]
public class GetExecutionSessionTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/sessions/sessionId").UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Submission.GetExecutionSessionAsync("sessionId", RequestOptions)
        );
    }
}
