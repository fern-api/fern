using NUnit.Framework;
using SeedApi.EndpointsParams;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.EndpointsParams;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsParamsGetWithAllowMultipleQueryTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params/allow-multiple")
                    .WithParam("query", "query")
                    .WithParam("number", "1")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.EndpointsParams.EndpointsParamsGetWithAllowMultipleQueryAsync(
                new EndpointsParamsGetWithAllowMultipleQueryRequest
                {
                    Query = ["query"],
                    Number = [1],
                }
            )
        );
    }
}
