using NUnit.Framework;
using SeedExhaustive.Endpoints;
using SeedExhaustive.Test.Unit.MockServer;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints;

[TestFixture]
public class GetWithAllowMultipleQueryTest : BaseMockServerTest
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

        Assert.DoesNotThrowAsync(async () =>
            await Client.Endpoints.Params.GetWithAllowMultipleQueryAsync(
                new GetWithMultipleQuery { Query = ["query"], Number = [1] }
            )
        );
    }
}
