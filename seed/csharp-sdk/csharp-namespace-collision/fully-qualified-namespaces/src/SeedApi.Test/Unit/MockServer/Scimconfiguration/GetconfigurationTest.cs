using NUnit.Framework;
using SeedApi.Test.Utils;

namespace SeedApi.Test.Unit.MockServer.Scimconfiguration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetconfigurationTest : BaseMockServerTest
{
    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest_1()
    {
        const string mockResponse = """
            {
              "connectionId": "connectionId",
              "connectionName": "connectionName",
              "strategy": "strategy",
              "tenant": "tenant"
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/scim-configuration").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Scimconfiguration.GetconfigurationAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }

    [Test]
    public async global::System.Threading.Tasks.Task MockServerTest_2()
    {
        const string mockResponse = """
            {
              "connectionId": "connectionId",
              "connectionName": "connectionName",
              "strategy": "strategy",
              "tenant": "tenant"
            }
            """;

        Server
            .Given(
                WireMock.RequestBuilders.Request.Create().WithPath("/scim-configuration").UsingGet()
            )
            .RespondWith(
                WireMock
                    .ResponseBuilders.Response.Create()
                    .WithStatusCode(200)
                    .WithBody(mockResponse)
            );

        var response = await Client.Scimconfiguration.GetconfigurationAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
