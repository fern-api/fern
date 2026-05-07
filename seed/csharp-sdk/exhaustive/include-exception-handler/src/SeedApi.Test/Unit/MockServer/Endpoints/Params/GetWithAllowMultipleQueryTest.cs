using NUnit.Framework;
using SeedApi.Endpoints;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Endpoints.Params;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetWithAllowMultipleQueryTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params/allow-multiple-query")
                    .WithParam("query", "query")
                    .WithParam("number", "1")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
                new GetWithAllowMultipleQueryParamsRequest { Query = ["query"], Number = [1] }
            )
        );
    }
}
