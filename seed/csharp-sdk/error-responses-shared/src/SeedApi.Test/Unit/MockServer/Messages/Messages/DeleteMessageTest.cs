using NUnit.Framework;
using SeedApi.Messages;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Messages.Messages;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class DeleteMessageTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/messages/sid").UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Messages.Messages.DeleteMessageAsync(
                new DeleteMessageRequest { Sid = "sid" }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/messages/sid").UsingDelete()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Messages.Messages.DeleteMessageAsync(
                new DeleteMessageRequest { Sid = "sid" }
            )
        );
    }
}
