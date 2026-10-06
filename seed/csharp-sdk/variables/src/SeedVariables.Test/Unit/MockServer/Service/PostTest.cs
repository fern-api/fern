using NUnit.Framework;
using SeedVariables;
using SeedVariables.Test.Unit.MockServer;

namespace SeedVariables.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/endpointParam").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        var client = new SeedVariablesClient(
            clientOptions: new ClientOptions
            {
                BaseUrl = Server.Urls[0],
                MaxRetries = 0,
                RootVariable = "endpointParam",
            }
        );

        Assert.DoesNotThrowAsync(async () => await client.Service.PostAsync());
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        Server
            .Given(WireMock.RequestBuilders.Request.Create().WithPath("/endpointParam").UsingPost())
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        var client = new SeedVariablesClient(
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
