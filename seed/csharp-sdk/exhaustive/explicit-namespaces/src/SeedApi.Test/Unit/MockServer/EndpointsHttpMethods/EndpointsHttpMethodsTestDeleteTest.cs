using NUnit.Framework;
using SeedApi.EndpointsHttpMethods;
using SeedApi.Test.Unit.MockServer;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.EndpointsHttpMethods;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class EndpointsHttpMethodsTestDeleteTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
    public async Task MockServerTest_1()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/http-methods/id").UsingDelete()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestDeleteAsync(
            new EndpointsHttpMethodsTestDeleteRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }

    [NUnit.Framework.Test]
    public async Task MockServerTest_2()
    {
        const string mockResponse = """
            true
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/http-methods/id").UsingDelete()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.EndpointsHttpMethods.EndpointsHttpMethodsTestDeleteAsync(
            new EndpointsHttpMethodsTestDeleteRequest { Id = "id" }
        );
        JsonAssert.AreEqual(response, mockResponse);
    }
}
