using NUnit.Framework;
using SeedExhaustive.Endpoints;

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetWithQueryTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Endpoints.Params.GetWithQueryAsync(
                    new GetWithQuery { Query = "query", Number = 1 },
                    RequestOptions
                )
        );
    }
}
