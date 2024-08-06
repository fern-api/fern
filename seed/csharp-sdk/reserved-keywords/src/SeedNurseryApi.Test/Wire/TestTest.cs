using NUnit.Framework;
using SeedNurseryApi;
using SeedNurseryApi.Test.Wire;

#nullable enable

namespace SeedNurseryApi.Test;

[TestFixture]
public class TestTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/")
                    .WithParam("for", "string")
                    .UsingPost()
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () =>
                Client
                    .Package.TestAsync(new TestRequest { For = "string" })
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
