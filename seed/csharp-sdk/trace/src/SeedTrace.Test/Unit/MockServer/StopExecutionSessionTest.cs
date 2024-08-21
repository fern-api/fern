using NUnit.Framework;
using SeedTrace.Test.Unit.MockServer;

#nullable enable

namespace SeedTrace.Test;

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
                    .WithPath("/sessions/stop/string")
                    .UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () => await Client.Submission.StopExecutionSessionAsync("string", RequestOptions)
        );
    }
}
