using Contoso.Net.Test.Unit.MockServer;
using Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.Scimconfiguration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetconfigurationTest : BaseMockServerTest
{
    [NUnit.Framework.Test]
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

    [NUnit.Framework.Test]
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
