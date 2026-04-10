using NUnit.Framework;
using SeedApi.EndpointsHttpMethods;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsHttpMethods;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsHttpMethodsTestGetTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/http-methods/id").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestGetAsync(
            new EndpointsHttpMethodsTestGetRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            "string"
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/http-methods/id").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestGetAsync(
            new EndpointsHttpMethodsTestGetRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
