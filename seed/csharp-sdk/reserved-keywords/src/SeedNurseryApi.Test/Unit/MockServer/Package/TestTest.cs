using NUnit.Framework;
using SeedNurseryApi;
using SeedNurseryApi.Test.Unit.MockServer;

namespace SeedNurseryApi.Test.Unit.MockServer.Package;

[TestFixture]
public class TestTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
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
