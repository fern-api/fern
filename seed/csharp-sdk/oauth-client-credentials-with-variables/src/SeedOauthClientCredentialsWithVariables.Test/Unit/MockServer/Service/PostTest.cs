using NUnit.Framework;
using SeedOauthClientCredentialsWithVariables.Test.Unit.MockServer;

namespace SeedOauthClientCredentialsWithVariables.Test.Unit.MockServer.Service;

[TestFixture]
public class PostTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/service/endpointParam")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () => await Client.Service.PostAsync("endpointParam"));
    }
}
