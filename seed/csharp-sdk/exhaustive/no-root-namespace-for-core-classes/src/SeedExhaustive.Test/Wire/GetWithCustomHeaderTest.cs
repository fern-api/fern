using NUnit.Framework;
using SeedExhaustive.Test.Wire;
using SeedExhaustive;

#nullable enable

namespace SeedExhaustive.Test;

[TestFixture]
public class GetWithCustomHeaderTest : BaseWireTest
{
    [Test]
    public void WireTest() {
        const string requestJson = """
        "string"
        """;


        Server.Given(WireMock.RequestBuilders.Request.Create().WithPath("/test-headers/custom-header").WithHeader("X-TEST-SERVICE-HEADER", "string").WithHeader("X-TEST-ENDPOINT-HEADER", "string").UsingPost().WithBodyAsJson(requestJson))

        .RespondWith(WireMock.ResponseBuilders.Response.Create()
        .WithStatusCode(200)
        );

        Assert.DoesNotThrowAsync(async () => await Client.ReqWithHeaders.GetWithCustomHeaderAsync(new ReqWithHeadersnew ReqWithHeaders{ 
                XTestEndpointHeader = "string", Body = "string"
            }, RequestOptions));}

}
