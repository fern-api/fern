using NUnit.Framework;
using SeedExhaustive.Endpoints;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetWithPathAndQueryTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Endpoints.Params.GetWithPathAndQueryAsync(
                    "param",
                    new GetWithPathAndQuery { Query = "query" },
                    RequestOptions
                )
        );
    }
}
