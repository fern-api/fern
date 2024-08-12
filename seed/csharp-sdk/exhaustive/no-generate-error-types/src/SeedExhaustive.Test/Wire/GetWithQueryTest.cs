using NUnit.Framework;
using SeedExhaustive.Endpoints;
using SeedExhaustive.Test.Wire;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetWithQueryTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/params")
                    .WithParam("query", "string")
                    .UsingGet()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () =>
                Client
                    .Endpoints.Params.GetWithQueryAsync(
                        new GetWithQuery { Query = "string", Number = 1 }
                    )
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
