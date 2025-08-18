using NUnit.Framework;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Test.Unit.MockServer;

namespace SeedExhaustive.Test.Unit.MockServer.Endpoints.Params;

[NUnit.Framework.TestFixture]
public class GetWithQueryTest : SeedExhaustive.Test.Unit.MockServer.BaseMockServerTest
{
    [NUnit.Framework.Test]
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
            await Client.Endpoints.Params.GetWithQueryAsync(
                new SeedExhaustive.Endpoints.Params.GetWithQuery { Query = "query", Number = 1 }
            )
        );
    }
}
