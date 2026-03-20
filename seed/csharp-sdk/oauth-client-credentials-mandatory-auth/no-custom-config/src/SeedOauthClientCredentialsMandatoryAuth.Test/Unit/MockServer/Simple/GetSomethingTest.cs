using NUnit.Framework;
using SeedOauthClientCredentialsMandatoryAuth.Test.Unit.MockServer;

namespace SeedOauthClientCredentialsMandatoryAuth.Test.Unit.MockServer.Simple;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetSomethingTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/get-something").UsingGet())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Simple.GetSomethingAsync());
    }
}
