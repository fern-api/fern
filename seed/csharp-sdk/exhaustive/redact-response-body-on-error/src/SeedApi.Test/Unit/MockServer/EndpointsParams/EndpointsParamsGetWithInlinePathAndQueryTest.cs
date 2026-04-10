using NUnit.Framework;
using SeedApi;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.EndpointsParams;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsParamsGetWithInlinePathAndQueryTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params/inline-path-query/param")
                    .WithParam("query", "query")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EndpointsParams.EndpointsParamsGetWithInlinePathAndQueryAsync(
                new EndpointsParamsGetWithInlinePathAndQueryRequest
                {
                    Param = "param",
                    Query = "query",
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
                    .WithPath("/params/inline-path-query/param")
                    .WithParam("query", "query")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EndpointsParams.EndpointsParamsGetWithInlinePathAndQueryAsync(
                new EndpointsParamsGetWithInlinePathAndQueryRequest
                {
                    Param = "param",
                    Query = "query",
                }
            )
        );
    }
}
