using NUnit.Framework;

namespace SeedOauthClientCredentialsEnvironmentVariables.Test.Unit.MockServer;

[TestFixture]
public class GetSomethingTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/get-something").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Simple.GetSomethingAsync());
    }
}
