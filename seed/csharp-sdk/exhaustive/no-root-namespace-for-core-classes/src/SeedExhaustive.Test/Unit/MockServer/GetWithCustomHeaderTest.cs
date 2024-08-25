using NUnit.Framework;
using SeedExhaustive;

#nullable enable

namespace SeedExhaustive.Test.Unit.MockServer;

[TestFixture]
public class GetWithCustomHeaderTest : BaseMockServerTest
{
    [Test]
    public void MockServerTest()
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

        Assert.DoesNotThrowAsync(
            async () =>
                await Client.ReqWithHeaders.GetWithCustomHeaderAsync(
                    new ReqWithHeaders { XTestEndpointHeader = "string", Body = "string" },
                    RequestOptions
                )
        );
    }
}
