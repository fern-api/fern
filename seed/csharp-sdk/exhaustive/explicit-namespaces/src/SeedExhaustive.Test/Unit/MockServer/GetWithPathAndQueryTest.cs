using NUnit.Framework;
using SeedExhaustive.Endpoints.Params;
using SeedExhaustive.Test.Unit.MockServer;

#nullable enable

namespace SeedExhaustive.Test;

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
                    .WithPath("/params/path-query/string")
                    .WithParam("query", "string")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.Endpoints.Params.GetWithPathAndQueryAsync(
                    "string",
                    new GetWithPathAndQuery { Query = "string" },
                    RequestOptions
                )
        );
    }
}
