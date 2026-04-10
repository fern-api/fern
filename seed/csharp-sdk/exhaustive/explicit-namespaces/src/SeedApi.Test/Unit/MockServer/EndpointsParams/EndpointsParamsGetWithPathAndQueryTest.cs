using NUnit.Framework;
using SeedApi.EndpointsParams;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.EndpointsParams;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsParamsGetWithPathAndQueryTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params/path-query/param")
                    .WithParam("query", "query")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EndpointsParams.EndpointsParamsGetWithPathAndQueryAsync(
                new EndpointsParamsGetWithPathAndQueryRequest { Param = "param", Query = "query" }
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
                    .WithPath("/params/path-query/param")
                    .WithParam("query", "query")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EndpointsParams.EndpointsParamsGetWithPathAndQueryAsync(
                new EndpointsParamsGetWithPathAndQueryRequest { Param = "param", Query = "query" }
            )
        );
    }
}
