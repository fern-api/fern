using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Service;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class PostTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test/pathParam/serviceParam/1/resourceParam")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.PostAsync(
                new ServicePostRequest
                {
                    PathParam = "pathParam",
                    ServiceParam = "serviceParam",
                    EndpointParam = 1,
                    ResourceParam = "resourceParam",
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test/pathParam/serviceParam/1/resourceParam")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Service.PostAsync(
                new ServicePostRequest
                {
                    PathParam = "pathParam",
                    ServiceParam = "serviceParam",
                    EndpointParam = 1,
                    ResourceParam = "resourceParam",
                }
            )
        );
    }
}
