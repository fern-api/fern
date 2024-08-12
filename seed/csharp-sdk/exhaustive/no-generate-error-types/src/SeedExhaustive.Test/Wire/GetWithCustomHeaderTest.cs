using NUnit.Framework;
using SeedExhaustive;
using SeedExhaustive.Test.Wire;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetWithCustomHeaderTest : BaseWireTest
{
    [Test]
    public void WireTest()
    {
        const string requestJson = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test-headers/custom-header")
                    .WithHeader("X-TEST-SERVICE-HEADER", "string")
                    .WithHeader("X-TEST-ENDPOINT-HEADER", "string")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrow(
            () =>
                Client
                    .ReqWithHeaders.GetWithCustomHeaderAsync(
                        new ReqWithHeaders { XTestEndpointHeader = "string", Body = "string" }
                    )
                    .GetAwaiter()
                    .GetResult()
        );
    }
}
