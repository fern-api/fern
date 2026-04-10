using NUnit.Framework;
using SeedApi.EndpointsParams;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.EndpointsParams;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsParamsGetWithQueryTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params")
                    .WithParam("query", "query")
                    .WithParam("number", "1")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EndpointsParams.EndpointsParamsGetWithQueryAsync(
                new EndpointsParamsGetWithQueryRequest { Query = "query", Number = 1 }
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
                    .WithPath("/params")
                    .WithParam("query", "query")
                    .WithParam("number", "1")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EndpointsParams.EndpointsParamsGetWithQueryAsync(
                new EndpointsParamsGetWithQueryRequest { Query = "query", Number = 1 }
            )
        );
    }
}
