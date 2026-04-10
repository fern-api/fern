using NUnit.Framework;
using SeedApi.Reqwithheaders;
using SeedApi.Test.Unit.MockServer;

namespace SeedApi.Test.Unit.MockServer.Reqwithheaders;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetwithcustomheaderTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public void MockServerTest_1()
    {
        const string requestJson = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test-headers/custom-header")
                    .WithHeader("X-TEST-ENDPOINT-HEADER", "testEndpointHeader")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Reqwithheaders.GetwithcustomheaderAsync(
                new ReqWithHeadersGetWithCustomHeaderRequest
                {
                    TestEndpointHeader = "testEndpointHeader",
                    Body = "string",
                }
            )
        );
    }

    [NUnit.Framework.Test]
    public void MockServerTest_2()
    {
        const string requestJson = """
            "string"
            """;

        Server
            .Given(
                WireMock
                    .RequestBuilders.Request.Create()
                    .WithPath("/test-headers/custom-header")
                    .WithHeader("X-TEST-ENDPOINT-HEADER", "X-TEST-ENDPOINT-HEADER")
                    .WithHeader("Content-Type", "application/json")
                    .UsingPost()
                    .WithBody(requestJson)
            )
            .RespondWith(WireMock.ResponseBuilders.Response.Create().WithStatusCode(200));

        Assert.DoesNotThrowAsync(async () =>
            await Client.Reqwithheaders.GetwithcustomheaderAsync(
                new ReqWithHeadersGetWithCustomHeaderRequest
                {
                    TestEndpointHeader = "X-TEST-ENDPOINT-HEADER",
                    Body = "string",
                }
            )
        );
    }
}
