using NUnit.Framework;

namespace SeedNurseryApi.Test.Unit.MockServer;

[TestFixture]
public class TestTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("for", "for")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Package.TestAsync(new TestRequest { For = "for" })
        );
    }
}
