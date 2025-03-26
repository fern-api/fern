using NUnit.Framework;
using SeedExhaustive.Endpoints.Params;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetWithInlinePathAndQueryTest : BaseMockServerTest
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
                await Client.Endpoints.Params.GetWithInlinePathAndQueryAsync(
                    "param",
                    new GetWithInlinePathAndQuery { Query = "query" },
                    RequestOptions
                )
        );
    }
}
