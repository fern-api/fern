using NUnit.Framework;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Test.Unit.MockServer;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[NUnit.Framework.TestFixture]
public class GetWithPathAndQueryTest : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
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

        Assert.DoesNotThrowAsync(async () =>
            await Client.Endpoints.Params.GetWithPathAndQueryAsync(
                "param",
                new SeedExhaustive.Endpoints.Params.GetWithPathAndQuery { Query = "query" }
            )
        );
    }
}
