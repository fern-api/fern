using NUnit.Framework;
using SeedOauthClientCredentialsMandatoryAuth.Test.Unit.MockServer;

namespace SeedOauthClientCredentialsMandatoryAuth.Test.Unit.MockServer.Nested;

[TestFixture]
public class GetSomethingTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/nested/get-something")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Nested.Api.GetSomethingAsync());
    }
}
