using NUnit.Framework;
using SeedOauthClientCredentialsWithVariables;
using SeedOauthClientCredentialsWithVariables.Test.Unit.MockServer;

namespace SeedOauthClientCredentialsWithVariables.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
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

        var client = new SeedOauthClientCredentialsWithVariablesClient(
            "client_id",
            "client_secret",
            clientOptions: new ClientOptions
            {
                BaseUrl = Server.Urls[0],
                MaxRetries = 0,
                RootVariable = "endpointParam",
            }
        );

        Assert.DoesNotThrowAsync(async () => await client.Service.PostAsync());
    }
}
