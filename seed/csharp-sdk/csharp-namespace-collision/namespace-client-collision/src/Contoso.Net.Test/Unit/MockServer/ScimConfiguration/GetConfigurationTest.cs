using global::Contoso.Net.Test.Unit.MockServer;
using global::Contoso.Net.Test.Utils;
using NUnit.Framework;

namespace Contoso.Net.Test.Unit.MockServer.ScimConfiguration;

[TestFixture]
[Parallelizable(ParallelScope.Self)]
public class GetConfigurationTest : BaseMockServerTest
{
    [global::NUnit.Framework.Test]
    public async global::System.Threading.Tasks.Task MockServerTest()
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

        var response = await Client.ScimConfiguration.GetConfigurationAsync();
        JsonAssert.AreEqual(response, mockResponse);
    }
}
